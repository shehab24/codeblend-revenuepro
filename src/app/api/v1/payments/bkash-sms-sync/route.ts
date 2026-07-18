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

    console.log(`[SMS Sync] Received request from user ${decoded.userId}. smsList length: ${smsList?.length || 0}`);

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

      // Allow bKash, Nagad, and Rocket SMS transactions (case-insensitive, including shortcodes)
      const normalizedSender = (sender || "").trim().toLowerCase();
      const allowedSenders = ["bkash", "nagad", "rocket", "16167", "16216", "dbbl"];
      const isAllowed = allowedSenders.some(allowed => normalizedSender.includes(allowed));
      if (!isAllowed) {
        console.log(`[SMS Sync] Skipping non-allowed sender address: ${sender}`);
        continue;
      }

      // Parse financial transaction details
      const parsed = parseFinancialSms(messageBody, sender);

      console.log(`[SMS Sync] Parsed SMS from ${sender}:`, {
        rawLength: messageBody.length,
        parsedTrxId: parsed.trxId || "NONE",
        parsedSender: parsed.sender || "NONE",
        parsedAmount: parsed.amount
      });

      if (!parsed.trxId || parsed.amount <= 0 || !parsed.sender) {
        console.log(`[SMS Sync] Message skipped: missing trxId, amount <= 0, or missing sender.`);
        continue;
      }

      try {
        // Insert or ignore if duplicate TrxID
        const existing = await prisma.bkashSmsTransaction.findUnique({
          where: { trxId: parsed.trxId },
        });

        if (!existing) {
          console.log(`[SMS Sync] Creating new transaction record for TrxID: ${parsed.trxId}`);
          await prisma.bkashSmsTransaction.create({
            data: {
              userId: decoded.userId,
              trxId: parsed.trxId,
              sender: parsed.sender,
              amount: parsed.amount,
              rawMessage: messageBody,
              senderAddress: sender,
              status: "unused",
              createdAt: parsed.dateObj || new Date(),
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
          console.log(`[SMS Sync] Transaction already exists (duplicate): ${parsed.trxId}`);
          duplicateCount++;
        }
      } catch (dbErr) {
        console.error(`Failed to save SMS transaction ${parsed.trxId}:`, dbErr);
      }
    }

    console.log(`[SMS Sync] Done processing. Saved: ${savedCount}, Duplicates: ${duplicateCount}`);

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

function parseSmsDateTime(message: string): Date | null {
  // Regex to match dates like DD/MM/YYYY HH:MM(:SS) or YYYY-MM-DD HH:MM(:SS)
  const match = message.match(/(?:at|Time|on)\s*:?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AP]M))?/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JS months are 0-11
    const year = parseInt(match[3], 10);
    let hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = match[6] ? parseInt(match[6], 10) : 0;
    const ampm = match[7];

    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
      if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
    }

    // bKash, Nagad, and Rocket SMS times are always in Bangladesh Standard Time (BST = UTC+6).
    // To store this correctly in UTC, we calculate the UTC timestamp and subtract 6 hours.
    const utcTimestamp = Date.UTC(year, month, day, hour, minute, second);
    const date = new Date(utcTimestamp - 6 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  const matchIso = message.match(/(?:at|Time|on)\s*:?\s*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AP]M))?/i);
  if (matchIso) {
    const year = parseInt(matchIso[1], 10);
    const month = parseInt(matchIso[2], 10) - 1;
    const day = parseInt(matchIso[3], 10);
    let hour = parseInt(matchIso[4], 10);
    const minute = parseInt(matchIso[5], 10);
    const second = matchIso[6] ? parseInt(matchIso[6], 10) : 0;
    const ampm = matchIso[7];

    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
      if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
    }

    const utcTimestamp = Date.UTC(year, month, day, hour, minute, second);
    const date = new Date(utcTimestamp - 6 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback for dates without at/Time/on prefix (common in Nagad block format: "18/07/2026 01:05")
  const matchNoPrefix = message.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AP]M))?\b/i);
  if (matchNoPrefix) {
    const day = parseInt(matchNoPrefix[1], 10);
    const month = parseInt(matchNoPrefix[2], 10) - 1;
    const year = parseInt(matchNoPrefix[3], 10);
    let hour = parseInt(matchNoPrefix[4], 10);
    const minute = parseInt(matchNoPrefix[5], 10);
    const second = matchNoPrefix[6] ? parseInt(matchNoPrefix[6], 10) : 0;
    const ampm = matchNoPrefix[7];

    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
      if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
    }

    const utcTimestamp = Date.UTC(year, month, day, hour, minute, second);
    const date = new Date(utcTimestamp - 6 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Parses financial SMS messages (bKash, Nagad, Rocket, Upay, Bank transfers)
 */
function parseFinancialSms(message: string, senderName: string) {
  let trxId = "";
  let amount = 0.0;
  let sender = "";

  // 1. Find TrxID (alphanumeric, typically 6-20 characters, e.g. 8N34KJL98S or Ref id)
  const trxMatch = message.match(/(?:TrxID|TxnID|TxID|TnxID|Txn\s*ID|Tx\s*ID|Tnx\s*ID|Transaction\s*ID|Ref\s*ID|Ref|Txn|Trx)\s*:?\s*([A-Z0-9]{6,20})/i);
  if (trxMatch) {
    trxId = trxMatch[1].toUpperCase().trim();
  }

  // 2. Find Amount (Tk XXX, BDT XXX, TK. XXX etc.)
  const amountMatch1 = message.match(/(?:received|credited|payment|of|In|out|debited|spent|paid)\s+(?:of\s+)?(?:Tk|TK|BDT|৳)\.?\s*([\d,]+\.?\d*)/i);
  const amountMatch2 = message.match(/(?:Tk|TK|BDT|৳)\.?\s*([\d,]+\.?\d*)\s+(?:received|payment|credited|debited|sent)/i);

  if (amountMatch1) {
    amount = parseFloat(amountMatch1[1].replace(/,/g, ""));
  } else if (amountMatch2) {
    amount = parseFloat(amountMatch2[1].replace(/,/g, ""));
  }

  // Fallback for amount if not matched by verbs: just look for Tk/TK/BDT/৳ followed by a number
  if (!amount || isNaN(amount)) {
    const fallbackAmountMatch = message.match(/(?:Tk|TK|BDT|৳)\.?\s*([\d,]+\.?\d*)/i);
    if (fallbackAmountMatch) {
      amount = parseFloat(fallbackAmountMatch[1].replace(/,/g, ""));
    }
  }

  // 3. Find sender phone number (typically 11 characters starting with 01, allowing masked digits like 0197****486)
  // First try: phone number directly after from/sender/by/to (bKash format)
  const senderMatch = message.match(/(?:from|sender|by|to)\s+(01[3-9][\d\*]{8})/i);
  if (senderMatch) {
    sender = senderMatch[1].trim();
  } else {
    // Second try: phone number anywhere in the message after from/Ac./A/C (Nagad NPSB format: "from other MFS Ac. 0197****486")
    const broadMatch = message.match(/(?:from|Ac\.|A\/C)\s+(?:[\w\s.]*?)(01[3-9][\d\*]{8})/i);
    if (broadMatch) {
      sender = broadMatch[1].trim();
    } else {
      // Third try: any 01X phone number pattern anywhere in the message body
      const anyPhoneMatch = message.match(/(01[3-9][\d\*]{8})/i);
      if (anyPhoneMatch) {
        sender = anyPhoneMatch[1].trim();
      } else {
        // Final fallback: use senderName (e.g. "NAGAD")
        const cleanSenderName = senderName.replace(/[^0-9]/g, "");
        if (cleanSenderName.length >= 11) {
          sender = cleanSenderName.substring(cleanSenderName.length - 11);
        } else {
          sender = senderName || "unknown";
        }
      }
    }
  }

  const dateObj = parseSmsDateTime(message);

  return { trxId, amount, sender, dateObj };
}
