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
