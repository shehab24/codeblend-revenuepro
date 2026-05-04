import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentID = url.searchParams.get("paymentID");
    const status = url.searchParams.get("status");
    const licenseId = url.searchParams.get("license_id");

    const baseUrlApp = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!paymentID || !licenseId) {
      return NextResponse.redirect(`${baseUrlApp}/dashboard/user/revenuepro`);
    }

    if (status === "cancel" || status === "failure") {
      // Mark local transaction as failed
      await prisma.paymentTransaction.updateMany({
        where: { transactionId: paymentID },
        data: { status: "failed", notes: `bKash status: ${status}` }
      });
      return NextResponse.redirect(`${baseUrlApp}/dashboard/user/revenuepro?payment=failed`);
    }

    // Need to execute payment
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["BKASH_API_APP_KEY", "BKASH_API_APP_SECRET", "BKASH_API_USERNAME", "BKASH_API_PASSWORD", "BKASH_API_IS_SANDBOX"]
        }
      }
    });

    const config: Record<string, string> = {};
    for (const s of settings) config[s.key] = s.value;

    const isSandbox = config["BKASH_API_IS_SANDBOX"] !== "false";
    const baseUrl = isSandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta' : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

    // 1. Get Token again for execution
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
      return NextResponse.redirect(`${baseUrlApp}/dashboard/user/revenuepro?payment=error`);
    }
    const idToken = tokenData.id_token;

    // 2. Execute Payment
    const execRes = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'x-app-key': config["BKASH_API_APP_KEY"]
      },
      body: JSON.stringify({ paymentID }),
      cache: 'no-store'
    });

    const execData = await execRes.json();

    if (execData && execData.statusCode === '0000' && execData.transactionStatus === 'Completed') {
      const trxID = execData.trxID;
      const customerMsisdn = execData.customerMsisdn || "";

      // 3. Mark transaction as completed and save real TrxID
      await prisma.paymentTransaction.updateMany({
        where: { transactionId: paymentID },
        data: { 
          status: "verified",
          transactionId: trxID, // Swap paymentID for real TrxID
          senderNumber: customerMsisdn
        }
      });

      // 4. Update License as Paid
      await prisma.license.update({
        where: { id: licenseId },
        data: { paymentStatus: "paid" }
      });

      return NextResponse.redirect(`${baseUrlApp}/dashboard/user/revenuepro/${licenseId}?payment=success`);
    } else {
      await prisma.paymentTransaction.updateMany({
        where: { transactionId: paymentID },
        data: { status: "failed", notes: execData.statusMessage || "Execution Failed" }
      });
      return NextResponse.redirect(`${baseUrlApp}/dashboard/user/revenuepro?payment=failed`);
    }
  } catch (error) {
    console.error("bKash Callback Error:", error);
    const baseUrlApp = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrlApp}/dashboard/user/revenuepro?payment=error`);
  }
}
