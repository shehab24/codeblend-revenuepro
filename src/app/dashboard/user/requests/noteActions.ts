"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function addUserRequestNote(requestId: string, message: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const trimmed = message.trim();
  if (!trimmed) return { success: false, error: "Message cannot be empty." };
  if (trimmed.length > 2000) return { success: false, error: "Message too long (max 2000 chars)." };

  // Verify the request belongs to this user
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return { success: false, error: "User not found." };

  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request || request.applicantId !== dbUser.id) {
    return { success: false, error: "Request not found." };
  }

  await prisma.requestNote.create({
    data: {
      serviceRequestId: requestId,
      authorRole: "user",
      authorName: dbUser.name || "You",
      message: trimmed,
    },
  });

  revalidatePath(`/dashboard/user/requests/${requestId}`);
  return { success: true };
}

export async function addAdminRequestNote(requestId: string, message: string) {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const trimmed = message.trim();
  if (!trimmed) return { success: false, error: "Message cannot be empty." };

  await prisma.requestNote.create({
    data: {
      serviceRequestId: requestId,
      authorRole: "admin",
      authorName: user.fullName || "Admin",
      message: trimmed,
    },
  });

  revalidatePath(`/dashboard/admin/requests/${requestId}`);
  revalidatePath(`/dashboard/user/requests/${requestId}`);
  return { success: true };
}
