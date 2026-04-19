"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function adminCreateLicense(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized access");
  
  const domain = formData.get("domain") as string;
  const durationStr = formData.get("duration") as string;
  const customerEmail = formData.get("customerEmail") as string | null;
  
  if (!domain || !durationStr) throw new Error("Missing required fields");

  let expirationDate: Date | null = new Date();

  let tier = "Lifetime (Uncapped)";
  if (durationStr === "2_min") {
    tier = "Developer Test (2 Mins)";
    expirationDate.setMinutes(expirationDate.getMinutes() + 2);
  } else if (durationStr === "5_min") {
    tier = "Developer Test (5 Mins)";
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);
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
      userId, // Owned by the admin initially
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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized access");

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

    if (!isNaN(duration) || license.tier === "0") {
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
                <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #0d9488); display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">R</div>
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

export async function adminDeleteLicense(licenseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized access");

  await prisma.license.delete({
    where: { id: licenseId }
  });

  revalidatePath("/dashboard/admin/licenses");
  return { success: true };
}

export async function adminPingLicense(licenseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized access");

  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license) throw new Error("Not found");

  const normalizeDomain = (d: string) => d.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const targetUrl = `http://${normalizeDomain(license.domain)}/wp-json/revenuepro/v1/status`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); 

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      await prisma.verificationLog.create({
        data: { licenseId, ipAddress: "outbound-ping", userAgent: "revenuepro-bot", status: "success" }
      });
    } else {
      await prisma.verificationLog.create({
        data: { licenseId, ipAddress: "outbound-ping", userAgent: "revenuepro-bot", status: "disconnected" }
      });
    }
  } catch (error) {
    await prisma.verificationLog.create({
      data: { licenseId, ipAddress: "outbound-ping", userAgent: "revenuepro-bot", status: "disconnected" }
    });
  }

  revalidatePath("/dashboard/admin/licenses");
  return { success: true };
}
