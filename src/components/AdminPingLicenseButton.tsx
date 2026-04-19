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
      title="Forcefully ping the WordPress domain to verify it is still actively using the plugin."
      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border-none cursor-pointer hover:bg-blue-500 hover:text-white transition mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Pinging..." : "Refresh Status"}
    </button>
  );
}
