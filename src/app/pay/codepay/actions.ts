"use server";

import { prisma } from "@/lib/prisma";

export async function verifyCodePayPayment(paymentId: string, trxId: string, method: string) {
  if (!paymentId || !trxId || !method) {
    return { success: false, message: "Missing required information." };
  }

  const cleanTrxId = trxId.trim().toUpperCase();

  try {
    // 1. Fetch payment session
    const payment = await prisma.codePayPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return { success: false, message: "Payment session not found." };
    }

    if (payment.status === "completed") {
      const redirectUrl = `${payment.redirectUrl}${payment.redirectUrl.includes("?") ? "&" : "?"}payment_id=${payment.id}&status=completed&order_id=${payment.orderId}`;
      return { success: true, redirectUrl };
    }

    // Bypass database lookup if sandbox TrxID 'SANDBOX123' is used
    if (cleanTrxId === "SANDBOX123") {
      const updatedPayment = await prisma.codePayPayment.update({
        where: { id: paymentId },
        data: {
          status: "completed",
          trxId: cleanTrxId,
          method: method,
        },
      });

      const redirectUrl = `${updatedPayment.redirectUrl}${updatedPayment.redirectUrl.includes("?") ? "&" : "?"}payment_id=${updatedPayment.id}&status=completed&order_id=${updatedPayment.orderId}`;
      return { success: true, redirectUrl };
    }

    // 2. Lookup parsed SMS transaction matching the TrxID and Scopes
    const smsTx = await prisma.bkashSmsTransaction.findFirst({
      where: {
        userId: payment.userId,
        trxId: cleanTrxId,
        amount: payment.amount,
        status: "unused",
      },
    });

    if (!smsTx) {
      return {
        success: false,
        message: `No matching transaction found. Please ensure you sent the exact amount (৳${payment.amount.toFixed(2)}) and entered the correct Transaction ID (TrxID).`,
      };
    }

    // 3. Mark transaction as used
    await prisma.bkashSmsTransaction.update({
      where: { id: smsTx.id },
      data: {
        status: "used",
        orderId: payment.orderId,
      },
    });

    // 4. Update checkout session status
    const updatedPayment = await prisma.codePayPayment.update({
      where: { id: paymentId },
      data: {
        status: "completed",
        trxId: cleanTrxId,
        method: method,
      },
    });

    const redirectUrl = `${updatedPayment.redirectUrl}${updatedPayment.redirectUrl.includes("?") ? "&" : "?"}payment_id=${updatedPayment.id}&status=completed&order_id=${updatedPayment.orderId}`;
    return { success: true, redirectUrl };
  } catch (error: any) {
    console.error("verifyCodePayPayment error:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}
