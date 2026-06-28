"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

/** Shared guard: throws if the caller is not an authenticated admin */
async function requireAdmin() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.publicMetadata?.role !== "admin") throw new Error("Unauthorized access");
}

export async function adminCreateLicense(formData: FormData) {
  const adminUser = await currentUser();
  if (!adminUser) throw new Error("Unauthorized");
  if (adminUser.publicMetadata?.role !== "admin") throw new Error("Unauthorized access");
  const userId = adminUser.id;

  const domain = formData.get("domain") as string;
  const durationStr = formData.get("duration") as string;
  const customerEmail = formData.get("customerEmail") as string | null;
  
  if (!domain || !durationStr || !customerEmail?.trim()) throw new Error("Missing required fields");

  let expirationDate: Date | null = new Date();

  let tier = "Lifetime (Uncapped)";
  if (durationStr === "2_min") {
    tier = "Developer Test (2 Mins)";
    expirationDate.setMinutes(expirationDate.getMinutes() + 2);
  } else if (durationStr === "5_min") {
    tier = "Developer Test (5 Mins)";
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);
  } else if (durationStr === "1_day") {
    tier = "1 Day (Short Trial)";
    expirationDate.setDate(expirationDate.getDate() + 1);
  } else if (durationStr === "5_day") {
    tier = "5 Days (Trial)";
    expirationDate.setDate(expirationDate.getDate() + 5);
  } else {
    const duration = parseInt(durationStr);
    if (duration === 15) {
      tier = "15 Days (Trial)";
      expirationDate.setDate(expirationDate.getDate() + 15);
    } else if (duration === 0) {
      expirationDate = null;
    } else {
      if (duration === 1) tier = "Basic Package (Monthly)";
      else if (duration === 2) tier = "Extended Package (2 Months)";
      else if (duration === 3) tier = "Quarterly Package";
      else if (duration === 6) tier = "Biannual Package";
      else if (duration === 12) tier = "Elite Package (Yearly)";
      
      expirationDate.setMonth(expirationDate.getMonth() + duration);
    }
  }

  const key = "REVPRO-WP-" + crypto.randomBytes(12).toString("hex").toUpperCase();

  await prisma.license.create({
    data: {
      userId,    // Owned by the admin initially
      customerEmail: customerEmail?.trim() || null,
      domain,
      tier,
      key,
      expirationDate,
    }
  });

  revalidatePath("/dashboard/admin/licenses");
  return { success: true };
}

import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API);

export async function adminToggleLicenseStatus(licenseId: string, status: string) {
  await requireAdmin();

  const license = await prisma.license.findUnique({ 
    where: { id: licenseId },
    include: { user: true }
  });
  if (!license) throw new Error("License not found");

  const updateData: any = { status };

  // If changing from pending to active for the very first time
  if (license.status === "pending" && status === "active") {
    const duration = parseInt(license.tier);
    
    // Automatically set the start date to NOW (Approval Date)
    updateData.createdAt = new Date();
    
    // Mint the actual API key now that it's approved
    let realKey = license.key;
    if (license.key.startsWith("PENDING-")) {
       realKey = "REVPRO-WP-" + crypto.randomBytes(12).toString("hex").toUpperCase();
       updateData.key = realKey;
    }

    let expirationDate: Date | null = new Date();
    let newTier = "1 Month (Basic)";
    
    if (license.tier === "0") {
      newTier = "Lifetime Access";
      expirationDate = null;
    } else if (license.tier === "trial") {
      newTier = "7 Days Free Trial";
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
    } else if (!isNaN(duration)) {
      if (duration === 1) newTier = "1 Month (Basic)";
      else if (duration === 2) newTier = "2 Months (Extended)";
      else if (duration === 3) newTier = "3 Months (Quarterly)";
      else if (duration === 6) newTier = "6 Months (Biannual)";
      else if (duration === 12) newTier = "1 Year (Elite)";
      
      expirationDate.setMonth(expirationDate.getMonth() + duration);
    } else {
      newTier = license.tier;
      expirationDate = license.expirationDate; 
    }

    if (!isNaN(duration) || license.tier === "0" || license.tier === "trial") {
       updateData.tier = newTier;
       updateData.expirationDate = expirationDate;
    }

    // Send the User an Email with their Shiny New Key
    const customerEmail = license.customerEmail || license.user?.email;
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: "CodeBlend <info@codeblend.co>",
          to: customerEmail,
          subject: `🎉 Your RevenuePro License is Ready!`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #0d9488); display: inline-block; text-align: center; color: white; font-weight: bold; font-size: 20px; margin: 0 auto;">C</div>
                <h2 style="margin: 12px 0 4px; color: #0f172a; font-size: 20px;">Revenue Pro</h2>
              </div>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Congratulations! Your license request for <strong>${license.domain}</strong> has been fully approved and generated.
              </p>
              
              <div style="background: #f0fdf4; border: 1px dashed #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <div style="color: #166534; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your API Key</div>
                <code style="color: #0f172a; font-size: 18px; font-weight: 800; background: #ffffff; padding: 8px 16px; border-radius: 6px; display: inline-block;">${realKey}</code>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #475569;"><strong>Tier:</strong> ${newTier}</p>
                <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Expires:</strong> ${expirationDate ? expirationDate.toLocaleDateString() : 'Never (Lifetime)'}</p>
              </div>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://codeblend.co"}/dashboard/user/revenuepro" 
                 style="display: block; text-align: center; background: #10b981; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 24px;">
                Download Plugin Now
              </a>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send activation email", err);
      }
    }
  }

  await prisma.license.update({ where: { id: licenseId }, data: updateData });
  revalidatePath("/dashboard/admin/licenses");
  return { success: true };
}

export async function adminTogglePaymentStatus(licenseId: string, paymentStatus: string) {
  await requireAdmin();

  await prisma.license.update({
    where: { id: licenseId },
    data: { paymentStatus }
  });

  revalidatePath("/dashboard/admin/licenses");
  return { success: true };
}

export async function adminDeleteLicense(licenseId: string) {
  await requireAdmin();

  await prisma.license.delete({
    where: { id: licenseId }
  });

  revalidatePath("/dashboard/admin/licenses");
  return { success: true };
}

export async function adminPingLicense(licenseId: string) {
  await requireAdmin();

  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license) throw new Error("Not found");

  const normalizeDomain = (d: string) => d.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const domain = normalizeDomain(license.domain);

  const tryFetch = (url: string, acceptStatuses: number[]): Promise<void> =>
    new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { "User-Agent": "revenuepro-bot" },
          signal: AbortSignal.timeout(10000),
        });
        if (acceptStatuses.includes(res.status)) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.status}`));
        }
      } catch (err) {
        reject(err);
      }
    });

  const base = `${domain}/wp-json/revenuepro-bkash-wc/v1`;

  // ── Step 1: Namespace must return 200 ──────────────────────────────────────
  // WordPress only returns 200 from a namespace index when the plugin is
  // actually installed and active. Security plugins return 401 here, not 200.
  let namespaceOk = false;
  try {
    await Promise.any([
      tryFetch(`https://${base}`, [200]),
      tryFetch(`http://${base}`,  [200]),
    ]);
    namespaceOk = true;
  } catch {
    namespaceOk = false;
  }

  // ── Step 2: Verify data is actually accessible ─────────────────────────────
  let siteDataOk = false;
  let pingMessage = "";

  if (namespaceOk) {
    // Check if we have a stored auth token from a previous license verification
    const tokenRecord = await prisma.setting.findUnique({
      where: { key: `SITE_TOKEN_${licenseId}` }
    });

    if (tokenRecord?.value) {
      /**
       * We have a token → do an authenticated fetch.
       * MUST return 200 with real data. Any other code (401=expired token,
       * 500=PHP error in handler, 404=route missing) means data is not accessible
       * and we should show Offline so it matches what "Sync Now" would show.
       */
      try {
        await Promise.any([
          tryFetch(`https://${base}/site-data?token=${encodeURIComponent(tokenRecord.value)}`, [200]),
          tryFetch(`http://${base}/site-data?token=${encodeURIComponent(tokenRecord.value)}`,  [200]),
        ]);
        siteDataOk = true;
        pingMessage = "Plugin is installed, license is active, and live data is accessible.";
      } catch {
        siteDataOk = false;
        pingMessage = "Plugin endpoint exists but data fetch failed (token expired, PHP error, or route missing). Ask customer to re-verify the license from plugin settings.";
      }
    } else {
      /**
       * No stored token yet — customer hasn't verified via the plugin.
       * Just confirm the site-data route is registered (returns 200 or 401).
       * 401 = route exists but needs auth (expected without a token).
       * 404 = route missing → plugin broken.
       * 500 = PHP error in the handler.
       */
      try {
        await Promise.any([
          tryFetch(`https://${base}/site-data`, [200, 401]),
          tryFetch(`http://${base}/site-data`,  [200, 401]),
        ]);
        siteDataOk = true;
        pingMessage = "Plugin is installed. Customer needs to verify their license from the plugin settings to enable live data sync.";
      } catch {
        siteDataOk = false;
        pingMessage = "Plugin namespace found but site-data endpoint is not responding. Plugin may be partially broken.";
      }
    }
  } else {
    pingMessage = "Plugin namespace not found. Plugin may be deactivated, uninstalled, or the site may be unreachable.";
  }

  const pingSuccess = namespaceOk && siteDataOk;

  if (pingSuccess) {
    await prisma.verificationLog.create({
      data: { licenseId, ipAddress: "outbound-ping", userAgent: "revenuepro-bot", status: "success" }
    });
  } else {
    await prisma.verificationLog.create({
      data: { licenseId, ipAddress: "outbound-ping", userAgent: "revenuepro-bot", status: "disconnected" }
    });
  }

  revalidatePath("/dashboard/admin/licenses");
  revalidatePath(`/dashboard/admin/licenses/${licenseId}`);
  return {
    success: true,
    isOnline: pingSuccess,
    message: pingMessage,
  };
}


export async function adminExtendLicense(licenseId: string, durationStr: string) {
  await requireAdmin();

  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license) throw new Error("License not found");

  let newExpiration: Date | null;
  let newTier = license.tier;

  // Start from NOW (not from old expiry) so even expired licenses get a fresh window
  const baseDate = new Date();

  if (durationStr === "0") {
    newExpiration = null;
    newTier = "Lifetime Access";
  } else if (durationStr === "1_day") {
    newExpiration = new Date(baseDate);
    newExpiration.setDate(newExpiration.getDate() + 1);
    newTier = "1 Day (Short Trial)";
  } else if (durationStr === "5_day") {
    newExpiration = new Date(baseDate);
    newExpiration.setDate(newExpiration.getDate() + 5);
    newTier = "5 Days (Trial)";
  } else if (durationStr === "15") {
    newExpiration = new Date(baseDate);
    newExpiration.setDate(newExpiration.getDate() + 15);
    newTier = "15 Days (Trial)";
  } else {
    const months = parseInt(durationStr);
    if (isNaN(months) || months <= 0) throw new Error("Invalid duration");
    
    newExpiration = new Date(baseDate);
    newExpiration.setMonth(newExpiration.getMonth() + months);

    if (months === 1) newTier = "1 Month (Basic)";
    else if (months === 2) newTier = "2 Months (Extended)";
    else if (months === 3) newTier = "3 Months (Quarterly)";
    else if (months === 6) newTier = "6 Months (Biannual)";
    else if (months === 12) newTier = "1 Year (Elite)";
  }

  await prisma.license.update({
    where: { id: licenseId },
    data: {
      expirationDate: newExpiration,
      tier: newTier,
      status: "active",
      paymentStatus: "paid",
    }
  });

  // Clean up renewal request if one existed
  try {
    await prisma.setting.delete({ where: { key: `RENEWAL_REQUEST_${licenseId}` } });
  } catch {}

  revalidatePath("/dashboard/admin/licenses");
  revalidatePath(`/dashboard/admin/licenses/${licenseId}`);
  revalidatePath("/dashboard/user/revenuepro");
  return { success: true };
}
