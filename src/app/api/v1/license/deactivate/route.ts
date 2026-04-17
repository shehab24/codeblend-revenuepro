import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { key, domain } = await request.json();

    if (!key || !domain) {
      return NextResponse.json({ success: false, error: "Missing key or domain" }, { status: 400 });
    }

    const license = await prisma.license.findUnique({
      where: { key }
    });

    if (!license) {
      return NextResponse.json({ success: false, error: "Invalid license key" }, { status: 404 });
    }

    // Safely strip https://, http://, and trailing slashes from both inputs
    const normalizeDomain = (d: string) => d.replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (normalizeDomain(license.domain) !== normalizeDomain(domain)) {
      return NextResponse.json({ success: false, error: "Domain mismatch" }, { status: 403 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "0.0.0.0";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Inserting a 'disconnected' log automatically overrides 'success' status physically
    // forcing the Next.js Dashboard to instantly evaluate the status as IDLE
    await prisma.verificationLog.create({
      data: { licenseId: license.id, ipAddress, userAgent, status: "disconnected" }
    });

    return NextResponse.json({ 
      success: true, 
      message: "License successfully unbound and disconnected." 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
