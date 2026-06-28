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
    const status = searchParams.get("status");
    const payment = searchParams.get("payment");
    const campaign = searchParams.get("campaign");
    if (limit) params.set("limit", limit);
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
