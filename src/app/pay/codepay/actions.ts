"use server";

import { prisma } from "@/lib/prisma";

export async function verifyCodePayPayment(
  paymentId: string,
  trxId: string | null,
  method: string,
  senderNumber?: string
) {
  if (!paymentId || !method) {
    return { success: false, message: "Missing required information." };
  }

  const cleanTrxId = trxId ? trxId.trim().toUpperCase() : null;

  try {
    // 1. Fetch payment session
    const payment = await prisma.codePayPayment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            codepayWithTrx: true,
            codepayWithoutTrx: true,
          },
        },
      },
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
          senderNumber: senderNumber || null,
        },
      });

      const redirectUrl = `${updatedPayment.redirectUrl}${updatedPayment.redirectUrl.includes("?") ? "&" : "?"}payment_id=${updatedPayment.id}&status=completed&order_id=${updatedPayment.orderId}`;
      return { success: true, redirectUrl };
    }

    // Verify without TrxID (Automatic matching by phone number)
    if (!cleanTrxId) {
      if (!payment.user.codepayWithoutTrx) {
        return { success: false, message: "Verification without Transaction ID is disabled by the merchant." };
      }
      if (!senderNumber || !senderNumber.trim()) {
        return { success: false, message: "Please provide a valid sender mobile number." };
      }

      const cleanedCustomerPhone = senderNumber.replace(/\D/g, "").slice(-10);
      if (cleanedCustomerPhone.length < 10) {
        return { success: false, message: "Invalid sender mobile number format." };
      }

      // Fetch all unused MFS transactions for this merchant with the same amount
      const unusedTransactions = await prisma.bkashSmsTransaction.findMany({
        where: {
          userId: payment.userId,
          amount: payment.amount,
          status: "unused",
        },
      });

      // Find one that matches the last 10 digits of the customer's phone
      const matchedTx = unusedTransactions.find((tx) => {
        const cleanedTxSender = tx.sender.replace(/\D/g, "").slice(-10);
        return cleanedTxSender === cleanedCustomerPhone;
      });

      if (!matchedTx) {
        return {
          success: false,
          message: `No matching transaction found. Please ensure you sent the exact amount (৳${payment.amount.toFixed(2)}) from the number ${senderNumber} and wait up to 1 minute for SMS sync.`,
        };
      }

      // Mark transaction as used
      await prisma.bkashSmsTransaction.update({
        where: { id: matchedTx.id },
        data: {
          status: "used",
          orderId: payment.orderId,
        },
      });

      // Update checkout session status
      const updatedPayment = await prisma.codePayPayment.update({
        where: { id: paymentId },
        data: {
          status: "completed",
          trxId: matchedTx.trxId,
          method: method,
          senderNumber: senderNumber,
        },
      });

      const redirectUrl = `${updatedPayment.redirectUrl}${updatedPayment.redirectUrl.includes("?") ? "&" : "?"}payment_id=${updatedPayment.id}&status=completed&order_id=${updatedPayment.orderId}`;
      return { success: true, redirectUrl };
    }

    // Verify with TrxID
    if (!payment.user.codepayWithTrx) {
      return { success: false, message: "Verification with Transaction ID is disabled by the merchant." };
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
        senderNumber: senderNumber || smsTx.sender,
      },
    });

    const redirectUrl = `${updatedPayment.redirectUrl}${updatedPayment.redirectUrl.includes("?") ? "&" : "?"}payment_id=${updatedPayment.id}&status=completed&order_id=${updatedPayment.orderId}`;
    return { success: true, redirectUrl };
  } catch (error: any) {
    console.error("verifyCodePayPayment error:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}
