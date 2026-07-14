"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { uploadToImageKit } from "@/lib/imagekit";

export async function saveGatewaySettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const bkash = formData.get("bkash") as string;
  const nagad = formData.get("nagad") as string;
  const rocket = formData.get("rocket") as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      codepayBkash: bkash || null,
      codepayNagad: nagad || null,
      codepayRocket: rocket || null,
    },
  });

  revalidatePath("/dashboard/user/payment-gateway");
  return { success: true };
}

export async function saveBrandingSettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const brandName = formData.get("brandName") as string;
  const brandColor = formData.get("brandColor") as string;
  let brandLogo = formData.get("brandLogo") as string;

  const logoFile = formData.get("logoFile") as File | null;
  if (logoFile && logoFile.size > 0) {
    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const base64 = buffer.toString("base64");
      brandLogo = await uploadToImageKit(base64, logoFile.name);
    } catch (err: any) {
      throw new Error(`Failed to upload logo to ImageKit: ${err.message || err}`);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      codepayBrandName: brandName || null,
      codepayBrandLogo: brandLogo || null,
      codepayBrandColor: brandColor || "#0f172a",
    },
  });

  revalidatePath("/dashboard/user/payment-gateway");
  return { success: true, brandLogo };
}

export async function generateGatewayKeys() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const apiKey = `cp_key_${crypto.randomBytes(16).toString("hex")}`;
  const apiSecret = `cp_sec_${crypto.randomBytes(24).toString("hex")}`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      codepayApiKey: apiKey,
      codepayApiSecret: apiSecret,
    },
  });

  revalidatePath("/dashboard/user/payment-gateway");
  return { success: true, apiKey, apiSecret };
}

export async function simulateSandboxSms(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const method = formData.get("method") as string;
  const sender = formData.get("sender") as string;
  const amountStr = formData.get("amount") as string;
  const trxId = formData.get("trxId") as string;

  if (!method || !sender || !amountStr || !trxId) {
    throw new Error("Missing required mock data.");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount.");
  }

  const cleanTrx = trxId.trim().toUpperCase();
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let rawMessage = "";

  if (method === "bkash") {
    rawMessage = `You have received Tk ${amount.toFixed(2)} from ${sender}. Fee Tk 0.00. Balance Tk 50,000.00. TrxID ${cleanTrx} at ${dateStr}`;
  } else if (method === "nagad") {
    rawMessage = `Nagad: You have received Tk ${amount.toFixed(2)} from ${sender}. Ref: CodePay. TxnID: ${cleanTrx} Time: ${dateStr}`;
  } else if (method === "rocket") {
    rawMessage = `Dbbl Mobile Banking: You have received BDT ${amount.toFixed(2)} from ${sender}. Ref: CodePay. TxID: ${cleanTrx} Time: ${dateStr}`;
  }

  await prisma.bkashSmsTransaction.create({
    data: {
      userId,
      trxId: cleanTrx,
      sender,
      amount,
      rawMessage,
      senderAddress: method.toUpperCase(),
      status: "unused",
      createdAt: now,
    },
  });

  revalidatePath("/dashboard/user/payment-gateway");
  return { success: true, trxId: cleanTrx };
}

export async function createSandboxPayment(formData: FormData, baseUrl: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const amountStr = formData.get("amount") as string;
  if (!amountStr) {
    throw new Error("Missing amount.");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount.");
  }

  // Create the Checkout Payment Session
  const payment = await prisma.codePayPayment.create({
    data: {
      userId,
      amount,
      orderId: `SANDBOX_${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Sandbox Tester",
      customerEmail: "sandbox@codeblend.co",
      redirectUrl: `${baseUrl}/dashboard/user/payment-gateway?sandbox_status=success`,
      status: "pending",
    },
  });

  const paymentUrl = `${baseUrl}/pay/codepay/${payment.id}`;

  revalidatePath("/dashboard/user/payment-gateway");
  return { success: true, paymentUrl };
}
