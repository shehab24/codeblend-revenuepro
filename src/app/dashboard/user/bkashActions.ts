"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function initiateBkashPayment(licenseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const license = await prisma.license.findUnique({ where: { id: licenseId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!license) return { error: "License not found" };

    let isAuthorized = false;
    if (license.userId === userId) {
      isAuthorized = true;
    } else if (license.customerEmail && user && license.customerEmail === user.email) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return { error: "Unauthorized access to license." };
    }

    // Determine pricing
    let amount = 1000;
    if (license.tier === "1") amount = 1000;
    else if (license.tier === "2") amount = 1800;
    else if (license.tier === "3") amount = 2500;
    else if (license.tier === "6") amount = 4500;
    else if (license.tier === "12") amount = 8000;
    else if (license.tier === "0") amount = 15000;

    // Get bKash Settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "BKASH_API_APP_KEY", 
            "BKASH_API_APP_SECRET", 
            "BKASH_API_USERNAME", 
            "BKASH_API_PASSWORD",
            "BKASH_API_IS_SANDBOX"
          ]
        }
      }
    });

    const config: Record<string, string> = {};
    for (const s of settings) config[s.key] = s.value;

    if (!config["BKASH_API_APP_KEY"] || !config["BKASH_API_APP_SECRET"]) {
      return { error: "bKash API is not fully configured by Admin." };
    }

    // Usually sandbox for development unless explicitly disabled
    const isSandbox = config["BKASH_API_IS_SANDBOX"] !== "false";
    const baseUrl = isSandbox 
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta' 
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

    // 1. Get Token
    const tokenRes = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'username': config["BKASH_API_USERNAME"],
        'password': config["BKASH_API_PASSWORD"]
      },
      body: JSON.stringify({
        app_key: config["BKASH_API_APP_KEY"],
        app_secret: config["BKASH_API_APP_SECRET"]
      }),
      cache: 'no-store'
    });

    const tokenData = await tokenRes.json();
    if (!tokenData || !tokenData.id_token) {
      console.error("bKash Token Error:", tokenData);
      return { error: "Failed to authenticate with bKash API." };
    }

    const idToken = tokenData.id_token;

    // 2. Create Payment Transaction locally (Pending)
    const baseUrlApp = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackURL = `${baseUrlApp}/api/v1/payments/bkash/callback?license_id=${license.id}`;

    // Generate local invoice reference
    const payerReference = `LIC-${license.id.slice(-6).toUpperCase()}-${Date.now()}`;

    // 3. Create Payment at bKash
    const createRes = await fetch(`${baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'x-app-key': config["BKASH_API_APP_KEY"]
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: payerReference,
        callbackURL: callbackURL,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: payerReference
      }),
      cache: 'no-store'
    });

    const createData = await createRes.json();
    
    if (!createData || !createData.bkashURL) {
      console.error("bKash Create Payment Error:", createData);
      return { error: createData.statusMessage || "Failed to create bKash checkout session." };
    }

    // Save transaction locally
    await prisma.paymentTransaction.create({
      data: {
        userId,
        licenseId,
        amount,
        paymentMethod: "bkash_api",
        transactionId: createData.paymentID, // store bKash paymentID as transactionId initially
        status: "pending"
      }
    });

    return { success: true, bkashURL: createData.bkashURL };

  } catch (err: any) {
    console.error("Bkash Init Error:", err);
    return { error: err.message || "Server Error" };
  }
}
