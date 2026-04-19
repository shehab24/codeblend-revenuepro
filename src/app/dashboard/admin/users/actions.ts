"use server";

import { prisma } from "@/lib/prisma";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleUserRole(formData: FormData) {
  // 1. Verify the caller is an admin
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can change roles.");
  }

  const targetUserId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as string; // "ADMIN" or "USER"

  if (!targetUserId || !newRole) throw new Error("Missing required fields.");

  // 2. Update in local DB
  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  // 3. Update Clerk publicMetadata so the role is recognized on next login
  const client = await clerkClient();
  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role: newRole === "ADMIN" ? "admin" : "user",
    },
  });

  revalidatePath("/dashboard/admin/users");
}
