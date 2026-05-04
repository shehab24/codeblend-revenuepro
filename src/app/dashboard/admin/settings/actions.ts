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
  const adminAlertEmail = formData.get("adminAlertEmail") as string;
  const revenueProPluginLinks = formData.get("revenueProPluginLinks") as string;
  
  if (bdCourierApiKey) {
    await prisma.setting.upsert({
      where: { key: "BD_COURIER_API_KEY" },
      create: { key: "BD_COURIER_API_KEY", value: bdCourierApiKey },
      update: { value: bdCourierApiKey }
    });
  }

  if (revenueProPluginLinks) {
    await prisma.setting.upsert({
      where: { key: "REVENUEPRO_PLUGIN_LINKS" },
      create: { key: "REVENUEPRO_PLUGIN_LINKS", value: revenueProPluginLinks },
      update: { value: revenueProPluginLinks }
    });
  }

  if (adminAlertEmail) {
    await prisma.setting.upsert({
      where: { key: "ADMIN_ALERT_EMAIL" },
      create: { key: "ADMIN_ALERT_EMAIL", value: adminAlertEmail },
      update: { value: adminAlertEmail }
    });
  }

  // Payment Settings
  const paymentKeys = [
    "BKASH_MANUAL_ENABLED", "BKASH_MANUAL_NUMBER", "BKASH_MANUAL_TYPE",
    "BKASH_API_ENABLED", "BKASH_API_APP_KEY", "BKASH_API_APP_SECRET",
    "BKASH_API_USERNAME", "BKASH_API_PASSWORD"
  ];

  for (const k of paymentKeys) {
    const val = formData.get(k) as string;
    if (val !== null) {
      await prisma.setting.upsert({
        where: { key: k },
        create: { key: k, value: val },
        update: { value: val }
      });
    }
  }

  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard/user/revenuepro"); // also revalidate the user side where links show up
  return { success: true };
}
