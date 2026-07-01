"use client";

import { useTransition } from "react";
import { adminToggleLicenseStatus } from "@/app/dashboard/admin/licenses/actions";

export function AdminToggleLicenseStatusButton({ licenseId, currentStatus }: { licenseId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      await adminToggleLicenseStatus(licenseId, newStatus);
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg border border-solid transition-all cursor-pointer outline-none ${
          currentStatus === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/55" :
          currentStatus === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/55" :
          currentStatus === "suspended" ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/55" :
          "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/55"
        }`}
      >
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
        <option value="revoked">Revoked</option>
      </select>
    </div>
  );
}
