import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const licenses = await prisma.license.findMany({ 
    include: { logs: { take: 3, orderBy: { timestamp: "desc" } } } 
  });
  return NextResponse.json({ total: licenses.length, licenses });
}
