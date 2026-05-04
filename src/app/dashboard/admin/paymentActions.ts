"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function verifyPayment(licenseId: string, transactionId: string, isVerified: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "admin" && user?.role !== "ADMIN") {
      return { error: "Unauthorized access" };
    }

    if (isVerified) {
      // Mark transaction as verified
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: "verified" }
      });

      // Mark license as paid
      await prisma.license.update({
        where: { id: licenseId },
        data: { paymentStatus: "paid" }
      });
    } else {
      // Reject transaction
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: "rejected" }
      });

      // Reset license payment status
      await prisma.license.update({
        where: { id: licenseId },
        data: { paymentStatus: "unpaid" }
      });
    }

    revalidatePath("/dashboard/admin/licenses");
    return { success: true };

  } catch (err: any) {
    console.error("Verify Payment Error:", err);
    return { error: "Server error during verification." };
  }
}
