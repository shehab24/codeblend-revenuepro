import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSettingsClient, PluginVersion } from "./client";

export default async function AdminSettingsPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const [bdCourierKeySetting, adminAlertEmailSetting, revenueProLinksSetting, legacyLinkSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "BD_COURIER_API_KEY" } }),
    prisma.setting.findUnique({ where: { key: "ADMIN_ALERT_EMAIL" } }),
    prisma.setting.findUnique({ where: { key: "REVENUEPRO_PLUGIN_LINKS" } }),
    prisma.setting.findUnique({ where: { key: "REVENUEPRO_PLUGIN_LINK" } }), // Fallback
  ]);

  let parsedLinks: PluginVersion[] = [];
  if (revenueProLinksSetting?.value) {
    try {
      parsedLinks = JSON.parse(revenueProLinksSetting.value);
    } catch {
      parsedLinks = [];
    }
  } else if (legacyLinkSetting?.value) {
    // Schema migration mapping
    parsedLinks = [{
      id: "legacy",
      version: "1.0.0",
      name: "Revenue Pro - Latest Build",
      link: legacyLinkSetting.value,
      isLatest: true
    }];
  }
  
  return (
    <div className="max-w-5xl">
      <AdminSettingsClient 
        currentKey={bdCourierKeySetting?.value || ""} 
        currentAlertEmail={adminAlertEmailSetting?.value || ""} 
        currentRevenueProLinks={parsedLinks}
      />
    </div>
  );
}
