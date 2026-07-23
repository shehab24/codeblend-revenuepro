import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Strip country code (+88/+880), spaces, hyphens — keep only digits
function sanitizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-\(\)]/g, "");
  cleaned = cleaned.replace(/^\+880/, "0");
  cleaned = cleaned.replace(/^\+88/, "0");
  cleaned = cleaned.replace(/^880/, "0");
  cleaned = cleaned.replace(/^88/, "0");
  cleaned = cleaned.replace(/[^0-9]/g, "");
  return cleaned;
}

async function fetchPathaoData(phone: string) {
  const pathaoClientIdSetting = await prisma.setting.findUnique({ where: { key: "PATHAO_CLIENT_ID" } });
  const pathaoClientSecretSetting = await prisma.setting.findUnique({ where: { key: "PATHAO_CLIENT_SECRET" } });

  if (!pathaoClientIdSetting?.value || !pathaoClientSecretSetting?.value) {
    return { success: false, error: "Pathao API credentials (Client ID/Secret) are not configured in Settings." };
  }

  const tokenRes = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/external/login", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: pathaoClientIdSetting.value.trim(),
      client_secret: pathaoClientSecretSetting.value.trim(),
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text().catch(() => "");
    return { success: false, error: `Pathao Login failed (HTTP ${tokenRes.status}): ${errText || tokenRes.statusText}` };
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return { success: false, error: `Pathao login response missing access_token: ${JSON.stringify(tokenData)}` };
  }

  const pRes = await fetch(`https://api-hermes.pathao.com/aladdin/api/v1/user/fraud-check?phone=${phone}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });

  if (!pRes.ok) {
    const pErrText = await pRes.text().catch(() => "");
    return { success: false, error: `Pathao Fraud Check failed (HTTP ${pRes.status}): ${pErrText || pRes.statusText}` };
  }

  const pData = await pRes.json();
  const rootObj = pData.data || pData;

  const total_orders = parseInt(rootObj.total_orders || rootObj.total_parcel) || 0;
  const successful_orders = parseInt(rootObj.successful_orders || rootObj.success_parcel) || 0;
  const cancelled_orders = parseInt(rootObj.cancelled_orders || rootObj.cancelled_parcel) || 0;

  return {
    success: true,
    data: {
      success: true,
      pathao: {
        total_parcel: total_orders,
        success_parcel: successful_orders,
        cancelled_parcel: cancelled_orders,
      },
    },
  };
}

async function fetchSteadfastData(phone: string) {
  const steadfastApiKeySetting = await prisma.setting.findUnique({ where: { key: "STEADFAST_API_KEY" } });
  const steadfastApiSecretSetting = await prisma.setting.findUnique({ where: { key: "STEADFAST_API_SECRET" } });

  if (!steadfastApiKeySetting?.value || !steadfastApiSecretSetting?.value) {
    return { success: false, error: "Steadfast API credentials (API Key/Secret Key) are not configured in Settings." };
  }

  const sfRes = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "api-key": steadfastApiKeySetting.value.trim(),
      "secret-key": steadfastApiSecretSetting.value.trim(),
    },
  });

  if (!sfRes.ok) {
    const sfErrText = await sfRes.text().catch(() => "");
    return { success: false, error: `Steadfast API failed (HTTP ${sfRes.status}): ${sfErrText || sfRes.statusText}` };
  }

  const sfData = await sfRes.json();
  if (sfData && (sfData.status === 401 || sfData.status === "401" || sfData.authorization === "401")) {
    return { success: false, error: `Steadfast API returned 401 Unauthorized: ${JSON.stringify(sfData)}` };
  }

  if (sfData && typeof sfData.total_parcels !== "undefined") {
    const total_parcels = parseInt(sfData.total_parcels) || 0;
    const total_delivered = parseInt(sfData.total_delivered) || 0;
    const cancelled = total_parcels - total_delivered;

    return {
      success: true,
      data: {
        success: true,
        steadfast: {
          total_parcel: total_parcels,
          success_parcel: total_delivered,
          cancelled_parcel: cancelled >= 0 ? cancelled : 0,
        },
      },
    };
  }

  return { success: false, error: `Steadfast API returned unexpected response: ${JSON.stringify(sfData)}` };
}

export async function POST(request: Request) {
  try {
    const { key, domain, phone: rawPhone, forceRefresh, provider = "auto" } = await request.json();

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

    // 1. Check local database first (if auto and not forceRefreshed)
    const existingRecords = await prisma.fraudStat.findMany({
      where: { phone },
      orderBy: { last_checked: "desc" }
    });

    const existing = existingRecords.length > 0 ? existingRecords[0] : null;
    if (existingRecords.length > 1) {
      const idsToDelete = existingRecords.slice(1).map(r => r.id);
      await prisma.fraudStat.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    const ONE_DAY = 24 * 60 * 60 * 1000;
    
    // Only return cache if provider is auto and not forceRefreshed
    if (provider === "auto" && !forceRefresh && existing && new Date().getTime() - new Date(existing.last_checked).getTime() < ONE_DAY) {
      if (licenseId && existing.licenseId !== licenseId) {
        await prisma.fraudStat.update({ where: { id: existing.id }, data: { licenseId } });
      }
      return NextResponse.json({
        success: true,
        source: "cache",
        data: existing
      });
    }

    let externalData = null;
    let fetchError = "";
    let source = "bdcourier_live_fetch";

    if (provider === "pathao") {
      const ptResult = await fetchPathaoData(phone);
      if (!ptResult.success) {
        return NextResponse.json({ success: false, error: ptResult.error }, { status: 502 });
      }
      externalData = ptResult.data;
      source = "pathao_direct";

    } else if (provider === "steadfast") {
      const sfResult = await fetchSteadfastData(phone);
      if (!sfResult.success) {
        return NextResponse.json({ success: false, error: sfResult.error }, { status: 502 });
      }
      externalData = sfResult.data;
      source = "steadfast_direct";

    } else {
      // provider === "auto" or "bdcourier"
      const bdCourierKeySetting = await prisma.setting.findUnique({ where: { key: "BD_COURIER_API_KEY" } });
      
      if (bdCourierKeySetting && bdCourierKeySetting.value) {
        const keys = bdCourierKeySetting.value.split(/[\n,;]+/).map((k: string) => k.trim()).filter(Boolean);
        for (let i = 0; i < keys.length; i++) {
          const keyToUse = keys[i];
          try {
            const res = await fetch("https://api.bdcourier.com/courier-check", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${keyToUse}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ phone })
            });

            if (res.ok) {
              const data = await res.json();
              if (data && (data.success || data.steadfast || data.pathao || data.data)) {
                externalData = data;
                break;
              } else {
                fetchError = `Key #${i + 1} returned invalid structure: ${JSON.stringify(data)}`;
              }
            } else {
              const errText = await res.text().catch(() => "");
              fetchError = `Key #${i + 1} failed (HTTP ${res.status}): ${errText || res.statusText}`;
            }
          } catch (err: any) {
            fetchError = `Key #${i + 1} error: ${err?.message || err}`;
          }
        }
      } else {
        fetchError = "BD Courier API key not configured.";
      }

      // If auto mode and BD Courier failed, run fallbacks: Pathao then Steadfast
      if (!externalData && provider === "auto") {
        const ptResult = await fetchPathaoData(phone);
        if (ptResult.success) {
          externalData = ptResult.data;
          source = "pathao_fallback";
        } else {
          fetchError += ` | Pathao Fallback Error: ${ptResult.error}`;
        }
      }

      if (!externalData && provider === "auto") {
        const sfResult = await fetchSteadfastData(phone);
        if (sfResult.success) {
          externalData = sfResult.data;
          source = "steadfast_fallback";
        } else {
          fetchError += ` | Steadfast Fallback Error: ${sfResult.error}`;
        }
      }
    }

    if (!externalData) {
      return NextResponse.json({ success: false, error: `Query failed for provider (${provider}). Error details: ${fetchError}` }, { status: 502 });
    }

    // Unwrap the payload
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

    let updatedStat = await prisma.fraudStat.upsert({
      where: { phone },
      update: payloadToSave,
      create: payloadToSave
    });

    return NextResponse.json({
      success: true,
      source,
      data: updatedStat
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal check endpoint error" }, { status: 500 });
  }
}
