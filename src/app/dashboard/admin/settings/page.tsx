import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSettingsClient, PluginVersion } from "./client";

export default async function AdminSettingsPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const [
    bdCourierKeySetting, 
    adminAlertEmailSetting, 
    revenueProLinksSetting, 
    legacyLinkSetting,
    bkashManualEnabled,
    bkashManualNumber,
    bkashManualType,
    bkashApiEnabled,
    bkashApiAppKey,
    bkashApiAppSecret,
    bkashApiUsername,
    bkashApiPassword
  ] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "BD_COURIER_API_KEY" } }),
    prisma.setting.findUnique({ where: { key: "ADMIN_ALERT_EMAIL" } }),
    prisma.setting.findUnique({ where: { key: "REVENUEPRO_PLUGIN_LINKS" } }),
    prisma.setting.findUnique({ where: { key: "REVENUEPRO_PLUGIN_LINK" } }), // Fallback
    prisma.setting.findUnique({ where: { key: "BKASH_MANUAL_ENABLED" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_MANUAL_NUMBER" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_MANUAL_TYPE" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_API_ENABLED" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_API_APP_KEY" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_API_APP_SECRET" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_API_USERNAME" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_API_PASSWORD" } }),
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
  
  const paymentSettings = {
    bkashManualEnabled: bkashManualEnabled?.value || "false",
    bkashManualNumber: bkashManualNumber?.value || "",
    bkashManualType: bkashManualType?.value || "personal",
    bkashApiEnabled: bkashApiEnabled?.value || "false",
    bkashApiAppKey: bkashApiAppKey?.value || "",
    bkashApiAppSecret: bkashApiAppSecret?.value || "",
    bkashApiUsername: bkashApiUsername?.value || "",
    bkashApiPassword: bkashApiPassword?.value || "",
  };
  
  return (
    <div className="max-w-5xl">
      <AdminSettingsClient 
        currentKey={bdCourierKeySetting?.value || ""} 
        currentAlertEmail={adminAlertEmailSetting?.value || ""} 
        currentRevenueProLinks={parsedLinks}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}
