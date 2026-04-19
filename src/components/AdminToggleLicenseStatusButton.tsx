"use client";

import { useTransition } from "react";
import { adminToggleLicenseStatus } from "@/app/dashboard/admin/licenses/actions";

export function AdminToggleLicenseStatusButton({ licenseId, currentStatus }: { licenseId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const newStatus = currentStatus === "active" ? "pending" : "active";
      await adminToggleLicenseStatus(licenseId, newStatus);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border-none cursor-pointer ${
        currentStatus === "active"
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      }`}
      title={currentStatus === "active" ? "Suspend License" : "Approve License"}
    >
      {isPending ? "..." : currentStatus === "active" ? "Suspend" : "Approve"}
    </button>
  );
}
