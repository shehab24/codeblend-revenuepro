import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Pull live data from a customer's WordPress site using the RevenuePro REST API.
 * 
 * Usage: GET /api/v1/license/site-data?license_id=xxx
 * 
 * Uses the stored JWT token (saved during license verification) to authenticate
 * with the customer's /wp-json/revenuepro-bkash-wc/v1/site-data endpoint.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get("license_id");

    if (!licenseId) {
      return NextResponse.json({ success: false, error: "license_id is required" }, { status: 400 });
    }

    const license = await prisma.license.findUnique({ where: { id: licenseId } });
    if (!license) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 });
    }

    if (license.status !== "active") {
      return NextResponse.json({ success: false, error: "License is not active" }, { status: 403 });
    }

    // Retrieve the stored token (saved during license verification)
    let authToken = "";
    
    const storedToken = await prisma.setting.findUnique({
      where: { key: `SITE_TOKEN_${license.id}` }
    });

    if (storedToken) {
      authToken = storedToken.value;
    } else {
      // No stored token — try to sign a fresh JWT on-the-fly
      try {
        const fs = await import("fs");
        const path = await import("path");
        const jwt = await import("jsonwebtoken");
        const keyPath = path.default.join(process.cwd(), 'keys', 'private_key.pem');
        const privateKey = fs.default.readFileSync(keyPath, 'utf8');
        
        const payload = {
          license: license.key,
          domain: license.domain,
          plan: license.tier,
          expiresAt: license.expirationDate ? license.expirationDate.getTime() : null,
        };
        authToken = jwt.default.sign(payload, privateKey, { algorithm: 'RS256' });
        
        // Save it for next time
        await prisma.setting.upsert({
          where: { key: `SITE_TOKEN_${license.id}` },
          create: { key: `SITE_TOKEN_${license.id}`, value: authToken },
          update: { value: authToken }
        });
      } catch {
        // No private key available — use the raw license key as fallback
        authToken = license.key;
      }
    }

    // Build the customer site URL with optional filter params
    const domain = license.domain.replace(/\/$/, '');
    const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;
    const params = new URLSearchParams({ token: authToken });
    
    // Pass through optional filter params
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const status = searchParams.get("status");
    const payment = searchParams.get("payment");
    const campaign = searchParams.get("campaign");
    if (limit) params.set("limit", limit);
    if (page) params.set("page", page);
    if (status) params.set("status", status);
    if (payment) params.set("payment", payment);
    if (campaign) params.set("campaign", campaign);
    
    const endpoint = `${siteUrl}/wp-json/revenuepro-bkash-wc/v1/site-data?${params.toString()}`;

    console.log(`\n[SITE-DATA PULL] Fetching from: ${siteUrl}\n`);

    let response: Response | null = null;
    let fetchError: any = null;

    try {
      response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'CodeBlend-RevenuePro-Server/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
        cache: 'no-store',
      });
    } catch (err: any) {
      fetchError = err;
      
      // If HTTPS failed due to SSL/TLS handshake or certificate verify issue, try falling back to HTTP
      if (siteUrl.startsWith('https://')) {
        const fallbackSiteUrl = siteUrl.replace(/^https:\/\//, 'http://');
        const fallbackEndpoint = `${fallbackSiteUrl}/wp-json/revenuepro-bkash-wc/v1/site-data?${params.toString()}`;
        console.log(`[SITE-DATA PULL] HTTPS fetch failed, trying HTTP fallback: ${fallbackSiteUrl}`);
        try {
          response = await fetch(fallbackEndpoint, {
            method: 'GET',
            headers: {
              'User-Agent': 'CodeBlend-RevenuePro-Server/1.0',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(15000), // 15 second timeout
            cache: 'no-store',
          });
          fetchError = null; // Clear error since fallback succeeded
        } catch (fallbackErr) {
          fetchError = fallbackErr;
        }
      }
    }

    if (fetchError) {
      throw fetchError;
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      const errorText = response ? await response.text().catch(() => "") : "";
      console.error(`[SITE-DATA PULL] HTTP ${status}: ${errorText.substring(0, 200)}`);

      // WordPress critical error (500) — their plugin is crashing
      if (status === 500) {
        // Try stripping HTML tags from the WP error body for a cleaner message
        const wpMessage = errorText
          .replace(/<[^>]+>/g, " ")    // strip HTML tags
          .replace(/\s+/g, " ")         // collapse whitespace
          .trim()
          .substring(0, 300);

        return NextResponse.json({
          success: false,
          error: "WordPress critical error on the customer site",
          details: "The RevenuePro plugin endpoint is crashing with a PHP fatal error on their WordPress server. " +
                   "Ask the customer to: 1) Check their WordPress error logs, 2) Deactivate conflicting plugins, " +
                   "3) Increase PHP memory_limit, or 4) Re-install the RevenuePro plugin.",
          wp_error: wpMessage || "Unknown WordPress error"
        }, { status: 502 });
      }

      return NextResponse.json({ 
        success: false, 
        error: `Site returned HTTP ${status}`,
        details: status === 404 ? "The RevenuePro plugin may not be installed or the REST API endpoint is not available." :
                 status === 401 ? "Token expired or invalid. Ask the customer to re-verify their license from the plugin settings." :
                 status === 403 ? "Access denied by the site." :
                 "Could not retrieve data from the customer site."
      }, { status: 502 });
    }

    const siteData = await response.json();
    
    // Process recent transactions asynchronously (non-blocking) to populate our FraudStat database
    if (siteData && Array.isArray(siteData.recent_transactions)) {
      processSyncOrders(siteData.recent_transactions, license.id, license.domain).catch((err) => {
        console.error("[SITE-DATA PULL] Error processing synced orders for fraud stats:", err);
      });
    }

    return NextResponse.json({
      success: true, 
      data: siteData,
      pulled_at: new Date().toISOString(),
      from: siteUrl,
    });

  } catch (error: any) {
    console.error("[SITE-DATA PULL] Error:", error.message);
    
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return NextResponse.json({ success: false, error: "Request timed out. The customer site may be slow or unreachable." }, { status: 504 });
    }

    if (error.cause?.code === 'ECONNREFUSED' || error.cause?.code === 'ENOTFOUND') {
      return NextResponse.json({ success: false, error: "Could not connect to the customer site. Domain may be offline or incorrect." }, { status: 502 });
    }

    if (error.message?.includes('fetch failed')) {
      return NextResponse.json({ success: false, error: "Could not establish connection to the customer site. This is usually due to local firewall, rate limiting, or SSL/TLS certificate configuration issues on their server." }, { status: 502 });
    }

    return NextResponse.json({ success: false, error: `Internal server error: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

function sanitizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-\(\)]/g, "");
  cleaned = cleaned.replace(/^\+880/, "0");
  cleaned = cleaned.replace(/^\+88/, "0");
  cleaned = cleaned.replace(/^880/, "0");
  cleaned = cleaned.replace(/^88/, "0");
  cleaned = cleaned.replace(/[^0-9]/g, "");
  return cleaned;
}

async function processSyncOrders(transactions: any[], licenseId: string, domain: string) {
  for (const trx of transactions) {
    try {
      if (!trx.phone) continue;
      const phone = sanitizePhone(String(trx.phone));
      if (phone.length !== 11) continue;

      // Skip if number already has an existing record/order ratio in FraudStat
      const existing = await prisma.fraudStat.findFirst({
        where: { phone }
      });
      if (existing) {
        continue;
      }

      const statusStr = (trx.status || "").toLowerCase();
      const isCancel = ["cancelled", "failed", "refunded"].includes(statusStr);
      const isSuccess = ["completed", "processing", "on-hold", "pending"].includes(statusStr) || !isCancel;

      let courier = "steadfast";
      const rawCourier = String(trx.courier || trx.courier_name || trx.courier_provider || trx.courier_data || "").toLowerCase();
      if (rawCourier.includes("pathao")) courier = "pathao";
      else if (rawCourier.includes("steadfast")) courier = "steadfast";
      else if (rawCourier.includes("parceldex")) courier = "parceldex";
      else if (rawCourier.includes("redx")) courier = "redx";
      else if (rawCourier.includes("paperfly")) courier = "paperfly";
      else if (rawCourier.includes("carrybee")) courier = "carrybee";

      const total_parcel = 1;
      const success_parcel = isSuccess ? 1 : 0;
      const cancelled_parcel = isCancel ? 1 : 0;
      const success_ratio = success_parcel ? 100 : 0;

      let pathao_success = 0, pathao_cancel = 0;
      let steadfast_success = 0, steadfast_cancel = 0;
      let parceldex_success = 0, parceldex_cancel = 0;
      let redx_success = 0, redx_cancel = 0;
      let paperfly_success = 0, paperfly_cancel = 0;
      let carrybee_success = 0, carrybee_cancel = 0;

      if (courier === "pathao") {
        if (isSuccess) pathao_success = 1; else pathao_cancel = 1;
      } else if (courier === "parceldex") {
        if (isSuccess) parceldex_success = 1; else parceldex_cancel = 1;
      } else if (courier === "redx") {
        if (isSuccess) redx_success = 1; else redx_cancel = 1;
      } else if (courier === "paperfly") {
        if (isSuccess) paperfly_success = 1; else paperfly_cancel = 1;
      } else if (courier === "carrybee") {
        if (isSuccess) carrybee_success = 1; else carrybee_cancel = 1;
      } else {
        // steadfast default
        if (isSuccess) steadfast_success = 1; else steadfast_cancel = 1;
      }

      await prisma.fraudStat.create({
        data: {
          licenseId,
          domain,
          phone,
          total_parcel,
          success_parcel,
          cancelled_parcel,
          success_ratio,
          pathao_success,
          pathao_cancel,
          steadfast_success,
          steadfast_cancel,
          parceldex_success,
          parceldex_cancel,
          redx_success,
          redx_cancel,
          paperfly_success,
          paperfly_cancel,
          carrybee_success,
          carrybee_cancel,
          courier_data: JSON.stringify({
            source: "plugin_sync",
            customer_name: trx.customer || null,
            order_id: trx.order_id || trx.order_number || null,
            payment_method: trx.payment_method || null,
            courier_provider: trx.courier || trx.courier_name || null,
            status: trx.status || null
          }),
          last_checked: new Date()
        }
      });
    } catch (err) {
      console.error("[processSyncOrders] Error saving trx phone record:", err);
    }
  }
}
