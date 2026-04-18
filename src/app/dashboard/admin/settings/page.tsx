import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSettingsClient } from "./client";

export default async function AdminSettingsPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const [bdCourierKeySetting, adminAlertEmailSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "BD_COURIER_API_KEY" } }),
    prisma.setting.findUnique({ where: { key: "ADMIN_ALERT_EMAIL" } })
  ]);
  
  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Global Settings Vault</h2>
      <div className="card" style={{ maxWidth: "600px", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>BD Courier Integration</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          This API key enables RevenuePro to directly bypass missing active records and proactively poll <code>api.bdcourier.com</code> whenever a WP Plugin requests an unprecedented fraud check for a new phone number.
        </p>
        <AdminSettingsClient currentKey={bdCourierKeySetting?.value || ""} currentAlertEmail={adminAlertEmailSetting?.value || ""} />
      </div>
    </div>
  );
}
