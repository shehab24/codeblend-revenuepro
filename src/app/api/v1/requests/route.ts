import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority, email, domain } = body;

    if (!title || !description || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields (title, description, email)" }, { status: 400 });
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
