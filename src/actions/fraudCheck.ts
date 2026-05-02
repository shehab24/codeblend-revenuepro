"use server";

import { prisma } from "@/lib/prisma";

function sanitizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-\(\)]/g, "");
  cleaned = cleaned.replace(/^\+880/, "0");
  cleaned = cleaned.replace(/^\+88/, "0");
  cleaned = cleaned.replace(/^880/, "0");
  cleaned = cleaned.replace(/^88/, "0");
  cleaned = cleaned.replace(/[^0-9]/g, "");
  return cleaned;
}

export async function checkFraudData(rawPhone: string) {
  try {
    if (!rawPhone) {
      return { success: false, error: "Missing phone number" };
    }

    const phone = sanitizePhone(rawPhone);

    if (phone.length !== 11) {
      return { success: false, error: "Please enter a valid 11 digit mobile number." };
    }

    // 1. Check local database first (30-day cache)
    const existing = await prisma.fraudStat.findFirst({
      where: { phone },
      orderBy: { last_checked: "desc" }
    });

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    if (existing && new Date().getTime() - new Date(existing.last_checked).getTime() < THIRTY_DAYS) {
      return {
        success: true,
        source: "cache",
        data: existing
      };
    }

    // 2. Fetch from BDCourier API
    const bdCourierKeySetting = await prisma.setting.findUnique({ where: { key: "BD_COURIER_API_KEY" } });

    if (!bdCourierKeySetting || !bdCourierKeySetting.value) {
      return { success: false, error: "BD Courier API key not configured." };
    }

    const res = await fetch("https://api.bdcourier.com/courier-check", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${bdCourierKeySetting.value}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone })
    });

    if (!res.ok) {
      return { success: false, error: "External courier API unreachable. Please try again later." };
    }

    const externalData = await res.json();
    const payloadData = externalData.data || externalData;

    const parseCount = (val: any) => parseInt(val) || 0;

    let pathao_success = 0, pathao_cancel = 0;
    let steadfast_success = 0, steadfast_cancel = 0;
    let parceldex_success = 0, parceldex_cancel = 0;
    let redx_success = 0, redx_cancel = 0;
    let paperfly_success = 0, paperfly_cancel = 0;
    let carrybee_success = 0, carrybee_cancel = 0;

    if (payloadData.pathao) {
      pathao_success = parseCount(payloadData.pathao.success_parcel);
      pathao_cancel = parseCount(payloadData.pathao.cancelled_parcel);
    }
    if (payloadData.steadfast) {
      steadfast_success = parseCount(payloadData.steadfast.success_parcel);
      steadfast_cancel = parseCount(payloadData.steadfast.cancelled_parcel);
    }
    if (payloadData.parceldex) {
      parceldex_success = parseCount(payloadData.parceldex.success_parcel);
      parceldex_cancel = parseCount(payloadData.parceldex.cancelled_parcel);
    }
    if (payloadData.redx) {
      redx_success = parseCount(payloadData.redx.success_parcel);
      redx_cancel = parseCount(payloadData.redx.cancelled_parcel);
    }
    if (payloadData.paperfly) {
      paperfly_success = parseCount(payloadData.paperfly.success_parcel);
      paperfly_cancel = parseCount(payloadData.paperfly.cancelled_parcel);
    }
    if (payloadData.carrybee) {
      carrybee_success = parseCount(payloadData.carrybee.success_parcel);
      carrybee_cancel = parseCount(payloadData.carrybee.cancelled_parcel);
    }

    const total_parcel = (pathao_success + pathao_cancel) + (steadfast_success + steadfast_cancel) +
      (parceldex_success + parceldex_cancel) + (redx_success + redx_cancel) +
      (paperfly_success + paperfly_cancel) + (carrybee_success + carrybee_cancel);
    const success_parcel = pathao_success + steadfast_success + parceldex_success + redx_success + paperfly_success + carrybee_success;
    const cancelled_parcel = pathao_cancel + steadfast_cancel + parceldex_cancel + redx_cancel + paperfly_cancel + carrybee_cancel;
    const success_ratio = total_parcel > 0 ? (success_parcel / total_parcel) * 100 : 0;

    const payloadToSave = {
      licenseId: null,
      domain: existing ? existing.domain : "marketing-fraud-check",
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
      courier_data: JSON.stringify(externalData),
      last_checked: new Date()
    };

    let savedStat;
    if (existing) {
      savedStat = await prisma.fraudStat.update({
        where: { id: existing.id },
        data: payloadToSave
      });
    } else {
      savedStat = await prisma.fraudStat.create({
        data: payloadToSave
      });
    }

    return {
      success: true,
      source: "bdcourier_live_fetch",
      data: savedStat
    };

  } catch (error: any) {
    console.error("Fraud Check Error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch fraud details"
    };
  }
}
