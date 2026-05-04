"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitManualPayment(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const licenseId = formData.get("licenseId") as string;
    const senderNumber = formData.get("senderNumber") as string;
    const trxId = formData.get("trxId") as string;

    if (!licenseId || !senderNumber || !trxId) {
      return { error: "সবগুলো ফিল্ড পূরণ করুন।" };
    }

    const license = await prisma.license.findUnique({
      where: { id: licenseId }
    });
    
    const user = await prisma.user.findUnique({ where: { id: userId }});

    if (!license) return { error: "License not found." };
    
    // Authorization check
    let isAuthorized = false;
    if (license.userId === userId) {
      isAuthorized = true;
    } else if (license.customerEmail && user && license.customerEmail === user.email) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      console.error(`Auth failed. license.userId=${license.userId}, authUserId=${userId}, license.email=${license.customerEmail}, user.email=${user?.email}`);
      return { error: "Unauthorized access to license." };
    }

    // Check if TrxID already used
    const existingTrx = await prisma.paymentTransaction.findUnique({
      where: { transactionId: trxId }
    });

    if (existingTrx) {
      return { error: "এই Transaction ID টি ইতিমধ্যে ব্যবহার করা হয়েছে।" };
    }

    // We don't necessarily know the exact amount here since it depends on the duration.
    // Ideally we store expectedAmount in License, but for now we set it to 0 and admin verifies.
    await prisma.paymentTransaction.create({
      data: {
        userId,
        licenseId,
        amount: 0, // Manual amount verified by Admin
        paymentMethod: "bkash_manual",
        transactionId: trxId,
        senderNumber: senderNumber,
        status: "pending"
      }
    });

    // Update License paymentStatus to pending_verification
    await prisma.license.update({
      where: { id: licenseId },
      data: { paymentStatus: "pending_verification" }
    });

    revalidatePath("/dashboard/user/revenuepro");
    return { success: true };

  } catch (err: any) {
    console.error("Manual Payment Error:", err);
    return { error: `সার্ভার এরর: ${err.message || "অজানা ত্রুটি"}` };
  }
}
