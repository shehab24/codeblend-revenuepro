import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Check active request count for an email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const activeCount = await prisma.serviceRequest.count({
      where: {
        contactEmail: email,
        status: { in: ["pending", "in_progress"] },
      },
    });

    return NextResponse.json({ success: true, activeCount });
  } catch (error: any) {
    console.error("Error checking request count:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority, email, domain } = body;

    if (!title || !description || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields (title, description, email)" }, { status: 400 });
    }

    // Check active request limit (max 2)
    const activeCount = await prisma.serviceRequest.count({
      where: {
        contactEmail: email,
        status: { in: ["pending", "in_progress"] },
      },
    });

    if (activeCount >= 2) {
      return NextResponse.json({
        success: false,
        limitReached: true,
        error: "You already have 2 active feature requests. Please login to our portal to manage them.",
      }, { status: 429 });
    }

    // Attempt to find a user by email to associate the request
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Format the message to include priority if provided
    const formattedMessage = `${description}\n\n[Priority: ${priority || "Normal"}]`;
    const serviceType = `Plugin Request: ${title}`;

    const newRequest = await prisma.serviceRequest.create({
      data: {
        applicantId: user ? user.id : undefined,
        contactEmail: email,
        serviceType: serviceType,
        message: formattedMessage,
        websiteUrl: domain || null,
        status: "pending",
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Request submitted successfully",
      data: newRequest
    });

  } catch (error: any) {
    console.error("Error submitting plugin request:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
