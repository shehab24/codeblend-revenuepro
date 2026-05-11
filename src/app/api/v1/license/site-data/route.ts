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
    const storedToken = await prisma.setting.findUnique({
      where: { key: `SITE_TOKEN_${license.id}` }
    });

    if (!storedToken) {
      return NextResponse.json({ 
        success: false, 
        error: "No site token found. The customer's plugin needs to verify the license first (Settings → Check License in the WordPress plugin)." 
      }, { status: 404 });
    }

    // Build the customer site URL
    const domain = license.domain.replace(/\/$/, '');
    const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;
    const endpoint = `${siteUrl}/wp-json/revenuepro-bkash-wc/v1/site-data?token=${encodeURIComponent(storedToken.value)}`;

    console.log(`\n[SITE-DATA PULL] Fetching from: ${siteUrl}\n`);

    // Hit the customer's WP REST API
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'CodeBlend-RevenuePro-Server/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[SITE-DATA PULL] HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      return NextResponse.json({ 
        success: false, 
        error: `Site returned HTTP ${response.status}`,
        details: response.status === 404 ? "The RevenuePro plugin may not be installed or the REST API endpoint is not available." :
                 response.status === 401 ? "Token expired or invalid. Ask the customer to re-verify their license from the plugin settings." :
                 response.status === 403 ? "Access denied by the site." :
                 "Could not retrieve data from the customer site."
      }, { status: 502 });
    }

    const siteData = await response.json();
    
    const responsePayload = {
      success: true, 
      data: siteData,
      pulled_at: new Date().toISOString(),
      from: siteUrl,
    };

    // Cache the data so it persists across page reloads
    await prisma.setting.upsert({
      where: { key: `SITE_DATA_${license.id}` },
      create: { key: `SITE_DATA_${license.id}`, value: JSON.stringify(responsePayload) },
      update: { value: JSON.stringify(responsePayload) }
    });

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error("[SITE-DATA PULL] Error:", error.message);
    
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return NextResponse.json({ success: false, error: "Request timed out. The customer site may be slow or unreachable." }, { status: 504 });
    }

    if (error.cause?.code === 'ECONNREFUSED' || error.cause?.code === 'ENOTFOUND') {
      return NextResponse.json({ success: false, error: "Could not connect to the customer site. Domain may be offline or incorrect." }, { status: 502 });
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
