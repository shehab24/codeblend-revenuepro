import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-codepay-api-key");
    const apiSecret = request.headers.get("x-codepay-api-secret");

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, message: "Missing X-CodePay-API-Key or X-CodePay-API-Secret headers." },
        { status: 401 }
      );
    }

    // Authenticate user gateway
    const user = await prisma.user.findFirst({
      where: {
        codepayApiKey: apiKey,
        codepayApiSecret: apiSecret,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid API credentials." },
        { status: 401 }
      );
    }

    // Check if the user is allowed to use CodePay Tracker
    if (!user.bkashTrackerAllowed) {
      return NextResponse.json(
        { success: false, message: "Access restricted: CodePay tracker is disabled on your account." },
        { status: 403 }
      );
    }

    // Check if gateway is suspended/blocked by admin
    if (!user.codepayActive) {
      return NextResponse.json(
        { success: false, message: "Gateway suspended: Your CodePay gateway is blocked by the administrator." },
        { status: 403 }
      );
    }

    // Parse payload
    const body = await request.json();
    const { payment_id, order_id } = body;

    if (!payment_id && !order_id) {
      return NextResponse.json(
        { success: false, message: "Either payment_id or order_id must be provided." },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await prisma.codePayPayment.findFirst({
      where: {
        userId: user.id,
        OR: [
          ...(payment_id ? [{ id: payment_id }] : []),
          ...(order_id ? [{ orderId: String(order_id) }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      amount: payment.amount,
      order_id: payment.orderId,
      status: payment.status,
      method: payment.method,
      trxId: payment.trxId,
      customer_name: payment.customerName,
      customer_email: payment.customerEmail,
      completed_at: payment.status === "completed" ? payment.updatedAt.toISOString() : null,
    });
  } catch (error: any) {
    console.error("CodePay Verify Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
