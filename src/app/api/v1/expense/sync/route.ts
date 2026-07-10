import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

// GET /api/v1/expense/sync — fetch all saved transactions for the authenticated user
export async function GET(request: Request) {
  const decoded = authenticateRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.expenseTransaction.findMany({
      where: { userId: decoded.userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("[Expense Sync GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/expense/sync — batch sync transactions from mobile client (offline-first)
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

    // Upsert transactions to avoid duplicate inputs
    const upsertPromises = transactions.map((tx: SyncTransactionInput) => {
      if (!tx.id || isNaN(tx.amount)) return Promise.resolve();

      return prisma.expenseTransaction.upsert({
        where: { id: tx.id },
        update: {
          amount: tx.amount,
          currency: tx.currency || "BDT",
          type: tx.type,
          merchant: tx.merchant,
          category: tx.category,
          date: new Date(tx.date),
          originalSms: tx.originalSms || null,
          senderAddress: tx.senderAddress || null,
        },
        create: {
          id: tx.id,
          userId: decoded.userId,
          amount: tx.amount,
          currency: tx.currency || "BDT",
          type: tx.type,
          merchant: tx.merchant,
          category: tx.category,
          date: new Date(tx.date),
          originalSms: tx.originalSms || null,
          senderAddress: tx.senderAddress || null,
        },
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, count: transactions.length });
  } catch (error) {
    console.error("[Expense Sync POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
