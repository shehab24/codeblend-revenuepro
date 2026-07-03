import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.CLERK_SECRET_KEY || "codeblend_revenuepro_fallback_secret_123456";

interface SmsMessage {
  sender: string;
  body: string;
  timestamp?: number;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token format" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid payload" },
        { status: 401 }
      );
    }

    // Verify user is active in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 }
      );
    }

    // 2. Parse Body
    const body = await request.json();
    const { smsList } = body;

    if (!smsList || !Array.isArray(smsList)) {
      return NextResponse.json(
        { error: "Invalid payload: smsList is required and must be an array" },
        { status: 400 }
      );
    }

    let savedCount = 0;
    let duplicateCount = 0;
    const processedList = [];

    for (const sms of smsList as SmsMessage[]) {
      const { sender, body: messageBody } = sms;
      if (!messageBody) continue;

      // Only process bKash messages (case-insensitive checks)
      const isBkash = sender?.toLowerCase() === "bkash" || messageBody.toLowerCase().includes("bkash");
      if (!isBkash) continue;

      // Parse bKash SMS details
      const parsed = parseBkashSms(messageBody);

      if (!parsed.trxId || parsed.amount <= 0 || !parsed.sender) {
        // Log skipped message if it contains bKash but isn't a transaction
        continue;
      }

      try {
        // Insert or ignore if duplicate TrxID
        const existing = await prisma.bkashSmsTransaction.findUnique({
          where: { trxId: parsed.trxId },
        });

        if (!existing) {
          await prisma.bkashSmsTransaction.create({
            data: {
              userId: decoded.userId,
              trxId: parsed.trxId,
              sender: parsed.sender,
              amount: parsed.amount,
              rawMessage: messageBody,
              status: "unused",
            },
          });
          savedCount++;
          processedList.push({
            trxId: parsed.trxId,
            sender: parsed.sender,
            amount: parsed.amount,
            status: "saved",
          });
        } else {
          duplicateCount++;
        }
      } catch (dbErr) {
        console.error(`Failed to save bKash SMS transaction ${parsed.trxId}:`, dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      processed: smsList.length,
      saved: savedCount,
      duplicates: duplicateCount,
      transactions: processedList,
    });

  } catch (error: any) {
    console.error("SMS Sync API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Parses bKash SMS messages for TrxID, Amount, and Sender Number
 */
function parseBkashSms(message: string) {
  let trxId = "";
  let amount = 0.0;
  let sender = "";

  // 1. Find TrxID (alphanumeric, typically 8-12 characters, e.g. 8N34KJL98S)
  const trxMatch = message.match(/TrxID\s*:?\s*([A-Z0-9]{8,12})/i);
  if (trxMatch) {
    trxId = trxMatch[1].toUpperCase().trim();
  }

  // 2. Find Amount
  const amountMatch1 = message.match(/(?:received|In|payment)\s+(?:of\s+)?(?:Tk|TK)\s*([\d,]+\.?\d*)/i);
  const amountMatch2 = message.match(/(?:Tk|TK)\s*([\d,]+\.?\d*)\s+(?:received|payment)/i);

  if (amountMatch1) {
    amount = parseFloat(amountMatch1[1].replace(/,/g, ""));
  } else if (amountMatch2) {
    amount = parseFloat(amountMatch2[1].replace(/,/g, ""));
  }

  // 3. Find sender phone number (typically 11 digits starting with 01)
  const senderMatch = message.match(/from\s+(01[3-9]\d{8})/i);
  if (senderMatch) {
    sender = senderMatch[1].trim();
  }

  return { trxId, amount, sender };
}
