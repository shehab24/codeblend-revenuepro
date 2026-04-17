"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function adminSaveSettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") throw new Error("Unauthorized access");

  const bdCourierApiKey = formData.get("bdCourierApiKey") as string;
  
  if (bdCourierApiKey) {
    await prisma.setting.upsert({
      where: { key: "BD_COURIER_API_KEY" },
      create: { key: "BD_COURIER_API_KEY", value: bdCourierApiKey },
      update: { value: bdCourierApiKey }
    });
  }

  revalidatePath("/dashboard/admin/settings");
  return { success: true };
}
