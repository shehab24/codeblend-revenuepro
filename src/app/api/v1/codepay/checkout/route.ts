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
        { success: false, message: "Access restricted: CodePay tracker is disabled on your account. Contact support." },
        { status: 403 }
      );
    }

    // Check if gateway is suspended/blocked by admin
    if (!user.codepayActive) {
      return NextResponse.json(
        { success: false, message: "Gateway suspended: Your CodePay gateway has been blocked by the administrator due to policy violations." },
        { status: 403 }
      );
    }

    // Parse payload
    const body = await request.json();
    const { amount, order_id, customer_name, customer_email, redirect_url } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: "Missing order_id." },
        { status: 400 }
      );
    }

    if (!redirect_url) {
      return NextResponse.json(
        { success: false, message: "Missing redirect_url." },
        { status: 400 }
      );
    }

    // Create payment session
    const payment = await prisma.codePayPayment.create({
      data: {
        userId: user.id,
        amount,
        orderId: String(order_id),
        customerName: customer_name || "Guest",
        customerEmail: customer_email || "",
        redirectUrl: redirect_url,
        status: "pending",
      },
    });

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const paymentUrl = `${protocol}://${host}/pay/codepay/${payment.id}`;

    return NextResponse.json({
      success: true,
      payment_url: paymentUrl,
      payment_id: payment.id,
      amount: payment.amount,
      order_id: payment.orderId,
    });
  } catch (error: any) {
    console.error("CodePay Create Checkout Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
