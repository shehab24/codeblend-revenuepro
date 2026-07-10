import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.CLERK_SECRET_KEY || "codeblend_revenuepro_fallback_secret_123456";

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

// GET /api/v1/expense/whitelist — fetch the user's saved keywords
export async function GET(request: Request) {
  const decoded = authenticateRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { whitelistKeywords: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, keywords: user.whitelistKeywords });
  } catch (error) {
    console.error("[Whitelist GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/expense/whitelist — save the user's keywords
export async function POST(request: Request) {
  const decoded = authenticateRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { keywords } = body;

    if (!Array.isArray(keywords)) {
      return NextResponse.json({ error: "keywords must be an array" }, { status: 400 });
    }

    // Sanitize: trim, deduplicate, remove empty
    const cleaned = [...new Set(keywords.map((k: string) => String(k).trim()).filter(Boolean))];

    const updated = await prisma.user.update({
      where: { id: decoded.userId },
      data: { whitelistKeywords: cleaned },
      select: { whitelistKeywords: true },
    });

    return NextResponse.json({ success: true, keywords: updated.whitelistKeywords });
  } catch (error) {
    console.error("[Whitelist POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
