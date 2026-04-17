import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const privateKeyPath = path.join(process.cwd(), 'keys', 'private_key.pem');
let privateKey = "";
try {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
} catch (error) {
  console.warn("Private key missing! Cannot sign JWT tokens.");
}

export async function POST(request: Request) {
  try {
    const { key, domain, email } = await request.json();

    if (!key || !domain) {
      return NextResponse.json({ valid: false, error: "Missing key or domain" }, { status: 400 });
    }

    const license = await prisma.license.findUnique({
      where: { key }
    });

    const ipAddress = request.headers.get("x-forwarded-for") || "0.0.0.0";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!license) {
      return NextResponse.json({ valid: false, error: "Invalid license key" }, { status: 401 });
    }

    if (license.customerEmail && (!email || license.customerEmail.toLowerCase() !== email.toLowerCase())) {
      await prisma.verificationLog.create({
        data: { licenseId: license.id, ipAddress, userAgent, status: "failed" }
      });
      return NextResponse.json({ valid: false, error: "Account email verification mismatch" }, { status: 403 });
    }

    if (license.status !== "active") {
      await prisma.verificationLog.create({
        data: { licenseId: license.id, ipAddress, userAgent, status: "failed" }
      });
      return NextResponse.json({ valid: false, error: "License is not active" }, { status: 401 });
    }

    // Safely strip https://, http://, and trailing slashes from both inputs
    const normalizeDomain = (d: string) => d.replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (normalizeDomain(license.domain) !== normalizeDomain(domain)) {
      await prisma.verificationLog.create({
        data: { licenseId: license.id, ipAddress, userAgent, status: "failed" }
      });
      return NextResponse.json({ valid: false, error: "Domain mismatch" }, { status: 403 });
    }

    if (license.expirationDate && new Date(license.expirationDate) < new Date()) {
      await prisma.verificationLog.create({
        data: { licenseId: license.id, ipAddress, userAgent, status: "failed" }
      });
      revalidatePath("/dashboard/admin/licenses");
      return NextResponse.json({ valid: false, error: "License expired" }, { status: 403 });
    }

    // Success
    await prisma.verificationLog.create({
      data: { licenseId: license.id, ipAddress, userAgent, status: "success" }
    });

    const payload = {
      license: license.key,
      domain: license.domain,
      plan: license.tier,
      expiresAt: license.expirationDate ? license.expirationDate.getTime() : null, // Unix Timestamp
    };

    let token = null;
    if (privateKey) {
      token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    }

    revalidatePath("/dashboard/admin/licenses");
    return NextResponse.json({ 
      valid: true, 
      message: "License is active and valid.",
      plan: license.tier,
      expiresAt: license.expirationDate,
      token: token
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
