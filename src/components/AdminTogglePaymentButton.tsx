"use client";

import { useTransition } from "react";
import { adminTogglePaymentStatus } from "@/app/dashboard/admin/licenses/actions";

export function AdminTogglePaymentButton({ licenseId, currentStatus }: { licenseId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    startTransition(async () => {
      await adminTogglePaymentStatus(licenseId, newStatus);
    });
  };

  const isPaid = currentStatus === "paid";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${
        isPaid 
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
      title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}
    >
      <span className={`w-2 h-2 rounded-full ${isPaid ? "bg-emerald-500" : "bg-slate-400"}`}></span>
      {isPending ? "Updating..." : isPaid ? "Paid" : "Unpaid"}
    </button>
  );
}
