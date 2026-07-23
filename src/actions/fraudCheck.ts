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

    const keys = bdCourierKeySetting.value.split(/[\n,;]+/).map((k: string) => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      return { success: false, error: "No valid BD Courier API keys configured." };
    }

    let externalData = null;
    let fetchError = "";

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

    let source = "bdcourier_live_fetch";

    if (!externalData) {
      // 1. Fallback to Pathao Backup API
      const pathaoClientIdSetting = await prisma.setting.findUnique({ where: { key: "PATHAO_CLIENT_ID" } });
      const pathaoClientSecretSetting = await prisma.setting.findUnique({ where: { key: "PATHAO_CLIENT_SECRET" } });

      if (pathaoClientIdSetting?.value && pathaoClientSecretSetting?.value) {
        try {
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

          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;

            if (accessToken) {
              const pRes = await fetch(`https://api-hermes.pathao.com/aladdin/api/v1/user/fraud-check?phone=${phone}`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
              });

              if (pRes.ok) {
                const pData = await pRes.json();
                const rootObj = pData.data || pData;

                const total_orders = parseInt(rootObj.total_orders || rootObj.total_parcel) || 0;
                const successful_orders = parseInt(rootObj.successful_orders || rootObj.success_parcel) || 0;
                const cancelled_orders = parseInt(rootObj.cancelled_orders || rootObj.cancelled_parcel) || 0;

                externalData = {
                  success: true,
                  pathao: {
                    total_parcel: total_orders,
                    success_parcel: successful_orders,
                    cancelled_parcel: cancelled_orders,
                  },
                };
                source = "pathao_fallback";
              } else {
                const pErrText = await pRes.text().catch(() => "");
                fetchError += ` | Pathao API HTTP error (${pRes.status}): ${pErrText || pRes.statusText}`;
              }
            } else {
              fetchError += ` | Pathao login failed to return access token: ${JSON.stringify(tokenData)}`;
            }
          } else {
            const tokenErrText = await tokenRes.text().catch(() => "");
            fetchError += ` | Pathao login HTTP error (${tokenRes.status}): ${tokenErrText || tokenRes.statusText}`;
          }
        } catch (err: any) {
          fetchError += ` | Pathao API connection error: ${err?.message || err}`;
        }
      }
    }

    if (!externalData) {
      // 2. Fallback to Steadfast Backup API
      const steadfastApiKeySetting = await prisma.setting.findUnique({ where: { key: "STEADFAST_API_KEY" } });
      const steadfastApiSecretSetting = await prisma.setting.findUnique({ where: { key: "STEADFAST_API_SECRET" } });

      if (steadfastApiKeySetting?.value && steadfastApiSecretSetting?.value) {
        try {
          const sfRes = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
            method: "GET",
            headers: {
              "content-type": "application/json",
              "api-key": steadfastApiKeySetting.value.trim(),
              "secret-key": steadfastApiSecretSetting.value.trim(),
            }
          });

          if (sfRes.ok) {
            const sfData = await sfRes.json();
            if (sfData && typeof sfData.total_parcels !== "undefined") {
              const total_parcels = parseInt(sfData.total_parcels) || 0;
              const total_delivered = parseInt(sfData.total_delivered) || 0;
              const cancelled = total_parcels - total_delivered;

              externalData = {
                success: true,
                steadfast: {
                  total_parcel: total_parcels,
                  success_parcel: total_delivered,
                  cancelled_parcel: cancelled >= 0 ? cancelled : 0
                }
              };
              source = "steadfast_fallback";
            } else {
              fetchError += ` | Steadfast returned unexpected structure: ${JSON.stringify(sfData)}`;
            }
          } else {
            const sfErrText = await sfRes.text().catch(() => "");
            fetchError += ` | Steadfast API HTTP error (${sfRes.status}): ${sfErrText || sfRes.statusText}`;
          }
        } catch (err: any) {
          fetchError += ` | Steadfast API connection error: ${err?.message || err}`;
        }
      }
    }

    if (!externalData) {
      return { success: false, error: `All configured BD Courier API tokens, Pathao fallback, and Steadfast fallback failed. Last error: ${fetchError}` };
    }

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
    savedStat = await prisma.fraudStat.upsert({
      where: { phone },
      update: payloadToSave,
      create: payloadToSave
    });

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
