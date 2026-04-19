"use client";

import { useTransition } from "react";
import { adminDeleteLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminDeleteLicenseButton({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete this license?")) {
      startTransition(async () => {
        await adminDeleteLicense(licenseId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "..." : "Revoke"}
    </button>
  );
}
