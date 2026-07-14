import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderNumber, trxId, amount, merchantId, orderId, order_id } = body;

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

    if (!trxId) {
      return NextResponse.json(
        { error: "Transaction ID (TrxID) is required" },
        { status: 400 }
      );
    }

    const targetAmount = parseFloat(amount);
    const matchedOrderId = (orderId || order_id || "").toString().trim();
    const cleanTrx = trxId.trim().toUpperCase();

    // 1. Try matching by Transaction ID first and enforce correct amount (+/- 1.0 Taka tolerance)
    const transaction = await prisma.bkashSmsTransaction.findFirst({
      where: {
        userId: merchantId,
        trxId: cleanTrx,
        amount: {
          gte: targetAmount - 1.0,
          lte: targetAmount + 1.0,
        },
        status: "unused",
      },
    });

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: "লেনদেনটি পাওয়া যায়নি অথবা টাকার পরিমাণ মেলেনি। অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি দিন এবং নিশ্চিত করুন যে সঠিক পরিমাণ টাকা পাঠানো হয়েছে।",
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

    // 3. Mark transaction as used and associate orderId
    await prisma.bkashSmsTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "used",
        orderId: matchedOrderId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully!",
      trxId: transaction.trxId,
      amount: transaction.amount,
      sender: transaction.sender,
      orderId: matchedOrderId || null,
    });

  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during payment verification" },
      { status: 500 }
    );
  }
}
