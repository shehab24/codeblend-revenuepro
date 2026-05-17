"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Send a server-side event to Facebook Conversions API.
 * This provides better data accuracy than browser-only pixel tracking.
 */
export async function sendFacebookCAPIEvent({
  eventName,
  eventId,
  sourceUrl,
  userData,
  customData,
}: {
  eventName: string;
  eventId: string;
  sourceUrl: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: Record<string, any>;
}) {
  try {
    // Fetch pixel settings from database
    const [pixelIdSetting, capiTokenSetting, testCodeSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "FB_PIXEL_ID" } }),
      prisma.setting.findUnique({ where: { key: "FB_CAPI_TOKEN" } }),
      prisma.setting.findUnique({ where: { key: "FB_TEST_EVENT_CODE" } }),
    ]);

    const pixelId = pixelIdSetting?.value;
    const capiToken = capiTokenSetting?.value;
    const testCode = testCodeSetting?.value;

    if (!pixelId || !capiToken) {
      console.log("[FB CAPI] Pixel ID or CAPI token not configured. Skipping.");
      return { success: false, reason: "not_configured" };
    }

    // Hash user data for privacy (Facebook requires SHA-256 hashing)
    const hashValue = (val?: string) =>
      val ? crypto.createHash("sha256").update(val.trim().toLowerCase()).digest("hex") : undefined;

    const eventData: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl,
      action_source: "website",
      user_data: {
        em: hashValue(userData?.email),
        ph: hashValue(userData?.phone),
        fn: hashValue(userData?.firstName),
        ln: hashValue(userData?.lastName),
        client_ip_address: userData?.clientIpAddress,
        client_user_agent: userData?.clientUserAgent,
        fbc: userData?.fbc,
        fbp: userData?.fbp,
      },
    };

    if (customData) {
      eventData.custom_data = customData;
    }

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`;
    const body: any = { data: [eventData] };

    // Add test event code if configured
    if (testCode) {
      body.test_event_code = testCode;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[FB CAPI] Error:", JSON.stringify(result));
      return { success: false, error: result };
    }

    console.log(`[FB CAPI] ✅ Event "${eventName}" sent successfully (event_id: ${eventId})`);
    return { success: true, result };
  } catch (error: any) {
    console.error("[FB CAPI] Exception:", error.message);
    return { success: false, error: error.message };
  }
}
