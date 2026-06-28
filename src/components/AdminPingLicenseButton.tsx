"use client";

import { useState, useTransition } from "react";
import { adminPingLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminPingLicenseButton({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ isOnline: boolean; message: string } | null>(null);

  const handlePing = () => {
    setResult(null);
    startTransition(async () => {
      const res = await adminPingLicense(licenseId);
      setResult({ isOnline: res.isOnline, message: res.message });
      // Auto-clear after 6 seconds
      setTimeout(() => setResult(null), 6000);
    });
  };

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <button
        onClick={handlePing}
        disabled={isPending}
        title="Check if the RevenuePro plugin is installed and active on the WordPress site."
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border-none cursor-pointer hover:bg-blue-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <span className={`inline-block w-3 h-3 ${isPending ? "animate-spin" : ""}`}>
          {isPending ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </span>
        {isPending ? "Checking..." : "Refresh Status"}
      </button>

      {result && (
        <div className={`text-[0.65rem] font-medium px-2 py-1 rounded-lg flex items-center gap-1.5 ${
          result.isOnline
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          <span>{result.isOnline ? "✓" : "✗"}</span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
