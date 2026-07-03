import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderNumber, trxId, amount, merchantId } = body;

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    if (!merchantId) {
      return NextResponse.json(
        { error: "merchantId is required to identify the store owner" },
        { status: 400 }
      );
    }

    if (!senderNumber && !trxId) {
      return NextResponse.json(
        { error: "Sender number or Transaction ID is required" },
        { status: 400 }
      );
    }

    const targetAmount = parseFloat(amount);

    // Clean phone number (remove country code prefix if present, only match last 11 digits)
    let cleanSender = "";
    if (senderNumber) {
      cleanSender = senderNumber.replace(/[^0-9]/g, "");
      if (cleanSender.length > 11) {
        cleanSender = cleanSender.substring(cleanSender.length - 11);
      }
    }

    let transaction: any = null;

    if (trxId) {
      // 1. Try matching by Transaction ID first
      const cleanTrx = trxId.trim().toUpperCase();
      transaction = await prisma.bkashSmsTransaction.findFirst({
        where: {
          userId: merchantId,
          trxId: cleanTrx,
          status: "unused",
        },
      });
    }

    if (!transaction && cleanSender) {
      // 2. Try matching by sender phone number and amount (since customer provided their number)
      // Allow +/- 1.0 Taka tolerance for rounding differences
      transaction = await prisma.bkashSmsTransaction.findFirst({
        where: {
          userId: merchantId,
          sender: {
            endsWith: cleanSender,
          },
          amount: {
            gte: targetAmount - 1.0,
            lte: targetAmount + 1.0,
          },
          status: "unused",
        },
        orderBy: {
          createdAt: "desc", // Match the most recent SMS
        },
      });
    }

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found. Please make sure the money was sent to our bKash number and try again in a few moments.",
      });
    }

    // Check if the transaction is older than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (transaction.createdAt < fifteenMinutesAgo) {
      return NextResponse.json({
        success: false,
        error: "পেমেন্ট সময়সীমা (১৫ মিনিট) পার হয়ে গেছে। সহায়তার জন্য যোগাযোগ করুন। (Payment verification timeframe of 15 minutes has expired. Please contact support.)",
      });
    }

    // 3. Mark transaction as used
    await prisma.bkashSmsTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "used",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully!",
      trxId: transaction.trxId,
      amount: transaction.amount,
      sender: transaction.sender,
    });

  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during payment verification" },
      { status: 500 }
    );
  }
}
