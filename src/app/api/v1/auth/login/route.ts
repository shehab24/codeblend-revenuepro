import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.CLERK_SECRET_KEY || "codeblend_revenuepro_fallback_secret_123456";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const lowerEmail = email.trim().toLowerCase();

    // 1. Find user in database
    let user = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    const client = await clerkClient();

    // 2. If user is not in our database, attempt to find them in Clerk and sync them
    if (!user) {
      try {
        const userList = await client.users.getUserList({
          emailAddress: [lowerEmail],
        });

        if (userList.data.length > 0) {
          const clerkUser = userList.data[0];
          const isAdmin = clerkUser.publicMetadata?.role === "admin";
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";

          user = await prisma.user.create({
            data: {
              id: clerkUser.id,
              email: lowerEmail,
              name,
              role: isAdmin ? "ADMIN" : "USER",
            },
          });
        } else {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          );
        }
      } catch (clerkErr) {
        console.error("Clerk user lookup error:", clerkErr);
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // 3. Verify user's password using Clerk Backend SDK
    try {
      const verifyResult = await client.users.verifyPassword({
        userId: user.id,
        password: password,
      });

      if (!verifyResult.verified) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    } catch (verifyErr: any) {
      console.error("Clerk password verification error:", verifyErr);
      const isNoPassword = verifyErr.errors?.some((e: any) => e.code === "no_password_set");
      if (isNoPassword) {
        return NextResponse.json(
          { error: "This account does not have a password set. Please log in using Google or OTP on the website." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Generate a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET
    );

    // 5. Return user data and auth token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        downloadAllowed: user.downloadAllowed,
        expenseTrackerAllowed: user.expenseTrackerAllowed,
        verified: user.verified,
        createdAt: user.createdAt,
      },
    });

  } catch (error: any) {
    console.error("Login API general error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
