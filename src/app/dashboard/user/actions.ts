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
        <p><strong>Requested Tier:</strong> ${duration === "0" ? "Lifetime" : duration + " Month(s)"}</p>
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
