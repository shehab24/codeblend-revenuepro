"use client";

import { useTransition } from "react";
import { adminPingLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminPingLicenseButton({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePing = () => {
    startTransition(async () => {
      await adminPingLicense(licenseId);
    });
  };

  return (
    <button 
      onClick={handlePing}
      disabled={isPending}
      className="btn"
      style={{ 
        padding: "0.3rem 0.6rem", 
        fontSize: "0.8rem", 
        backgroundColor: "rgba(59, 130, 246, 0.1)", 
        color: "var(--primary)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.7 : 1,
        borderRadius: "4px",
        marginRight: "0.5rem"
      }}
      title="Forcefully ping the WordPress domain to verify it is still actively using the plugin."
    >
      {isPending ? "Pinging..." : "Refresh Status"}
    </button>
  );
}
