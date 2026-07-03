"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import nodemailer from "nodemailer";

export async function createLicense(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const domain = formData.get("domain") as string;
  const duration = formData.get("duration") as string || "1";
  if (!domain) throw new Error("Domain is required");

  // Create a pending placeholder; the real key generates upon admin approval!
  const key = "PENDING-" + crypto.randomBytes(12).toString("hex").toUpperCase();

  await prisma.license.create({
    data: {
      userId,
      domain,
      key,
      tier: duration, // We store the requested months here temporarily until approved
      status: "pending",
    }
  });

  // Alert Admin via Email
  try {
    const alertEmailSetting = await prisma.setting.findUnique({ where: { key: "ADMIN_ALERT_EMAIL" } });
    const alertEmail = alertEmailSetting?.value || "mdshehab204@gmail.com";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"CodeBlend System" <hello@codeblend.co>',
      to: alertEmail,
      subject: `🛡️ New RevenuePro License Requested`,
      html: `
        <h3>RevenuePro License Application</h3>
        <p><strong>Customer Email:</strong> ${user.email}</p>
        <p><strong>Target Domain:</strong> ${domain}</p>
        <p><strong>Requested Tier:</strong> ${duration === "0" ? "Lifetime" : duration === "trial" ? "7 Days Free Trial" : duration + " Month(s)"}</p>
        <hr/>
        <p>Login to your admin dashboard to generate and issue the API Key.</p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send admin alert for license:", emailError);
  }

  revalidatePath("/dashboard/user");
  return { success: true };
}

export async function renewLicense(licenseId: string, duration: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const license = await prisma.license.findFirst({
    where: {
      id: licenseId,
      OR: [
        { userId },
        { customerEmail: user.email }
      ]
    }
  });

  if (!license) throw new Error("License not found or unauthorized");

  // Update payment status to unpaid so the payment flow triggers
  await prisma.license.update({
    where: { id: licenseId },
    data: {
      paymentStatus: "unpaid",
      // Store the requested renewal duration temporarily in a setting
    }
  });

  // Store renewal request details
  await prisma.setting.upsert({
    where: { key: `RENEWAL_REQUEST_${licenseId}` },
    create: { key: `RENEWAL_REQUEST_${licenseId}`, value: JSON.stringify({ duration, requestedAt: new Date().toISOString(), userId }) },
    update: { value: JSON.stringify({ duration, requestedAt: new Date().toISOString(), userId }) }
  });

  // Alert Admin via Email
  try {
    const alertEmailSetting = await prisma.setting.findUnique({ where: { key: "ADMIN_ALERT_EMAIL" } });
    const alertEmail = alertEmailSetting?.value || "mdshehab204@gmail.com";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"CodeBlend System" <hello@codeblend.co>',
      to: alertEmail,
      subject: `🔄 RevenuePro License Renewal Request`,
      html: `
        <h3>License Renewal Request</h3>
        <p><strong>Customer:</strong> ${user.email}</p>
        <p><strong>Domain:</strong> ${license.domain}</p>
        <p><strong>Current Key:</strong> ${license.key}</p>
        <p><strong>Requested Duration:</strong> ${duration === "0" ? "Lifetime" : duration + " Month(s)"}</p>
        <hr/>
        <p>Login to your admin dashboard to extend the expiry date after payment confirmation.</p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send renewal alert:", emailError);
  }

  revalidatePath("/dashboard/user/revenuepro");
  revalidatePath(`/dashboard/user/revenuepro/${licenseId}`);
  return { success: true };
}

export async function deleteLicense(licenseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.license.delete({
    where: {
      id: licenseId,
      userId,
    }
  });

  revalidatePath("/dashboard/user");
  return { success: true };
}

export async function getBkashSmsTransactions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const transactions = await prisma.bkashSmsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, transactions };
  } catch (error: any) {
    console.error("Error fetching bkash SMS transactions:", error);
    return { success: false, error: error.message || "Failed to fetch transactions" };
  }
}
