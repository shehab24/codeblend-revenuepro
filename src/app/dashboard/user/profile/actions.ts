"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserPhone(phone: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const cleaned = phone.replace(/\s+/g, "").trim();
  if (cleaned && !/^01\d{9}$/.test(cleaned)) {
    return { error: "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { phone: cleaned || null }
  });

  revalidatePath("/dashboard/user/profile");
  return { success: true };
}
