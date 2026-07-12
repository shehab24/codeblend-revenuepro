import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { uploadToImageKit } from "@/lib/imagekit";

const JWT_SECRET = process.env.JWT_SECRET || process.env.CLERK_SECRET_KEY || "codeblend_revenuepro_fallback_secret_123456";

interface SyncTransactionInput {
  id: string;
  amount: number;
  currency?: string;
  type: string;
  merchant: string;
  category: string;
  date: string;
  originalSms?: string;
  senderAddress?: string;
}

function authenticateRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded?.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/v1/expense/sync — fetch all saved transactions for the authenticated user (fetched from ImageKit CDN)
export async function GET(request: Request) {
  const decoded = authenticateRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { expenseBackupUrl: true },
    });

    if (user?.expenseBackupUrl) {
      console.log(`[Expense Sync GET] Fetching backup JSON from: ${user.expenseBackupUrl}`);
      const res = await fetch(user.expenseBackupUrl);
      if (res.ok) {
        const transactions = await res.json();
        return NextResponse.json({ success: true, transactions });
      } else {
        console.error(`[Expense Sync GET] Failed to fetch ImageKit backup file. Status: ${res.statusText}`);
      }
    }

    return NextResponse.json({ success: true, transactions: [] });
  } catch (error) {
    console.error("[Expense Sync GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/expense/sync — batch sync transactions from mobile client (uploaded to ImageKit CDN as backup)
export async function POST(request: Request) {
  const decoded = authenticateRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { transactions } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Invalid payload: transactions must be an array" }, { status: 400 });
    }

    console.log(`[Expense Sync] Received ${transactions.length} transactions from user ${decoded.userId}`);

    // 1. Convert transactions to JSON string and base64
    const jsonString = JSON.stringify(transactions);
    const base64Data = Buffer.from(jsonString).toString("base64");
    const fileName = `expense-backup-${decoded.userId}.json`;

    // 2. Upload to ImageKit (useUniqueFileName = false to overwrite the previous backup file)
    console.log(`[Expense Sync] Uploading backup JSON file to ImageKit: ${fileName}`);
    const expenseBackupUrl = await uploadToImageKit(base64Data, fileName, false);
    console.log(`[Expense Sync] Backup URL successfully created: ${expenseBackupUrl}`);

    // 3. Update user record with the backup URL
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { expenseBackupUrl },
    });

    // 4. Delete legacy individual database rows from ExpenseTransaction to free up DB space!
    const deleteResult = await prisma.expenseTransaction.deleteMany({
      where: { userId: decoded.userId },
    });
    if (deleteResult.count > 0) {
      console.log(`[Expense Sync] Cleaned up ${deleteResult.count} legacy DB rows from ExpenseTransaction.`);
    }

    return NextResponse.json({ success: true, count: transactions.length, backupUrl: expenseBackupUrl });
  } catch (error) {
    console.error("[Expense Sync POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
