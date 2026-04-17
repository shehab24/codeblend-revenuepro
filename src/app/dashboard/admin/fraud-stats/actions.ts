"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteFraudStat(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.fraudStat.delete({ where: { id } });
  revalidatePath("/dashboard/admin/fraud-stats");
  return { success: true };
}

export async function editFraudStatPhone(id: string, newPhone: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized");

  const cleaned = newPhone.replace(/[\s\-\(\)]/g, "")
    .replace(/^\+880/, "0")
    .replace(/^\+88/, "0")
    .replace(/^880/, "0")
    .replace(/^88/, "0")
    .replace(/[^0-9]/g, "");

  await prisma.fraudStat.update({
    where: { id },
    data: { phone: cleaned }
  });
  revalidatePath("/dashboard/admin/fraud-stats");
  return { success: true };
}
