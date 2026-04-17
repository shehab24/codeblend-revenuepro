import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Strip country code (+88/+880), spaces, hyphens — keep only digits
function sanitizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-\(\)]/g, ""); // remove spaces, hyphens, parens
  cleaned = cleaned.replace(/^\+880/, "0");       // +880 → 0
  cleaned = cleaned.replace(/^\+88/, "0");        // +88  → 0
  cleaned = cleaned.replace(/^880/, "0");          // 880  → 0
  cleaned = cleaned.replace(/^88/, "0");           // 88   → 0
  cleaned = cleaned.replace(/[^0-9]/g, "");        // strip anything non-numeric
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const { key, domain, phone: rawPhone } = await request.json();

    if (!rawPhone) {
      return NextResponse.json({ success: false, error: "Missing phone number" }, { status: 400 });
    }

    const phone = sanitizePhone(String(rawPhone));

    // Try to attach to a license strictly for ownership tracking (optional)
    let licenseId: string | null = null;
    if (key) {
      const license = await prisma.license.findUnique({ where: { key } });
      if (license) licenseId = license.id;
    }

    // 1. Check local database first!
    const existing = await prisma.fraudStat.findFirst({
      where: { phone },
      orderBy: { last_checked: "desc" }
    });

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    
    // If it exists and firmly checked within the last 30 days, organically return it!
    if (existing && new Date().getTime() - new Date(existing.last_checked).getTime() < THIRTY_DAYS) {
      return NextResponse.json({
        success: true,
        source: "cache",
        data: existing
      });
    }

    // 2. Fetch from External BDCourier API since either not found OR forcefully expired
    const bdCourierKeySetting = await prisma.setting.findUnique({ where: { key: "BD_COURIER_API_KEY" } });
    
    if (!bdCourierKeySetting || !bdCourierKeySetting.value) {
      return NextResponse.json({ success: false, error: "BD Courier API key not configured in Admin Dashboard." }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "External API unreachable or restricted." }, { status: 502 });
    }

    const externalData = await res.json();
    
    // Unwrap the nested 'data' object from BD Courier API payload
    const payloadData = externalData.data || externalData;

    const parseCount = (path: any) => parseInt(path) || 0;

    let pathao_total = 0, pathao_success = 0, pathao_cancel = 0;
    let steadfast_total = 0, steadfast_success = 0, steadfast_cancel = 0;
    let parceldex_total = 0, parceldex_success = 0, parceldex_cancel = 0;
    let redx_total = 0, redx_success = 0, redx_cancel = 0;
    let paperfly_total = 0, paperfly_success = 0, paperfly_cancel = 0;
    let carrybee_total = 0, carrybee_success = 0, carrybee_cancel = 0;

    if (payloadData.pathao) {
      pathao_total = parseCount(payloadData.pathao.total_parcel);
      pathao_success = parseCount(payloadData.pathao.success_parcel);
      pathao_cancel = parseCount(payloadData.pathao.cancelled_parcel);
    }
    if (payloadData.steadfast) {
      steadfast_total = parseCount(payloadData.steadfast.total_parcel);
      steadfast_success = parseCount(payloadData.steadfast.success_parcel);
      steadfast_cancel = parseCount(payloadData.steadfast.cancelled_parcel);
    }
    if (payloadData.parceldex) {
      parceldex_total = parseCount(payloadData.parceldex.total_parcel);
      parceldex_success = parseCount(payloadData.parceldex.success_parcel);
      parceldex_cancel = parseCount(payloadData.parceldex.cancelled_parcel);
    }
    if (payloadData.redx) {
      redx_total = parseCount(payloadData.redx.total_parcel);
      redx_success = parseCount(payloadData.redx.success_parcel);
      redx_cancel = parseCount(payloadData.redx.cancelled_parcel);
    }
    if (payloadData.paperfly) {
      paperfly_total = parseCount(payloadData.paperfly.total_parcel);
      paperfly_success = parseCount(payloadData.paperfly.success_parcel);
      paperfly_cancel = parseCount(payloadData.paperfly.cancelled_parcel);
    }
    if (payloadData.carrybee) {
      carrybee_total = parseCount(payloadData.carrybee.total_parcel);
      carrybee_success = parseCount(payloadData.carrybee.success_parcel);
      carrybee_cancel = parseCount(payloadData.carrybee.cancelled_parcel);
    }

    const total_parcel = pathao_total + steadfast_total + parceldex_total + redx_total + paperfly_total + carrybee_total;
    const success_parcel = pathao_success + steadfast_success + parceldex_success + redx_success + paperfly_success + carrybee_success;
    const cancelled_parcel = pathao_cancel + steadfast_cancel + parceldex_cancel + redx_cancel + paperfly_cancel + carrybee_cancel;
    const success_ratio = total_parcel > 0 ? (success_parcel / total_parcel) * 100 : 0;

    const payloadToSave = {
      licenseId,
      domain: domain || (existing ? existing.domain : "direct-api"),
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

    let updatedStat;
    if (existing) {
      updatedStat = await prisma.fraudStat.update({
        where: { id: existing.id },
        data: payloadToSave
      });
    } else {
      updatedStat = await prisma.fraudStat.create({
        data: payloadToSave
      });
    }

    return NextResponse.json({
      success: true,
      source: "bdcourier_live_fetch",
      data: updatedStat
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal check endpoint error" }, { status: 500 });
  }
}
