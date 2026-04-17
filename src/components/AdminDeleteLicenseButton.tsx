"use client";

import { useTransition } from "react";
import { adminDeleteLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminDeleteLicenseButton({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete this license? The WordPress target will immediately fail authentication upon its next check.")) {
      startTransition(async () => {
        await adminDeleteLicense(licenseId);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="btn"
      style={{ 
        padding: "0.3rem 0.6rem", 
        fontSize: "0.8rem", 
        backgroundColor: "rgba(239, 68, 68, 0.1)", 
        color: "var(--error)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.7 : 1,
        borderRadius: "4px"
      }}
    >
      {isPending ? "..." : "Revoke"}
    </button>
  );
}
