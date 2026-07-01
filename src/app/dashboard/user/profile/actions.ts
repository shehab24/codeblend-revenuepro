"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserPhone(phone: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const cleaned = phone.replace(/\s+/g, "").trim();
  if (!cleaned) {
    return { error: "ফোন নম্বর দেওয়া আবশ্যিক" };
  }
  if (!/^01\d{9}$/.test(cleaned)) {
    return { error: "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { phone: cleaned }
  });

  revalidatePath("/dashboard/user/profile");
  return { success: true };
}

export async function updateUserPassword(password: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const trimmed = password.trim();
  if (trimmed.length < 8) {
    return { error: "Password must be at least 8 characters long (পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে)" };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      password: trimmed,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Clerk updateUser password error:", error);
    return { error: error.message || "Failed to update password (পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে)" };
  }
}
