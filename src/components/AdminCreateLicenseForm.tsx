"use client";

import { useTransition } from "react";
import { adminCreateLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminCreateLicenseForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await adminCreateLicense(formData);
      (document.getElementById("admin-license-form") as HTMLFormElement).reset();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="mb-4 pb-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">Issue New WP License</h3>
        <p className="text-sm text-slate-400 mt-1">Generate a time-tiered license for a WordPress domain.</p>
      </div>
      <form id="admin-license-form" action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="domain">Target Installation Domain</label>
          <input
            type="text"
            id="domain"
            name="domain"
            placeholder="e.g., clientwebsite.com"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="duration">Validation Tier Duration</label>
          <select
            id="duration"
            name="duration"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition appearance-none"
          >
            <option value="2_min">2 Minutes (Fast Test Expiry)</option>
            <option value="5_min">5 Minutes (Test Expiry)</option>
            <option value="1_day">1 Day (Short Trial)</option>
            <option value="5_day">5 Days (Trial)</option>
            <option value="15">15 Days (Trial)</option>
            <option value="1">1 Month (Basic)</option>
            <option value="2">2 Months (Extended)</option>
            <option value="3">3 Months (Quarterly)</option>
            <option value="6">6 Months (Biannual)</option>
            <option value="12">12 Months (Elite/Yearly)</option>
            <option value="0">Lifetime Access (Never Expires)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="customerEmail">Assigned Customer Email</label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            required
            placeholder="e.g., client@domain.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            If provided, the WP site MUST verify using this exact email for anti-piracy binding.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
        >
          {isPending ? "Generating Secure License..." : "Generate WP License Key"}
        </button>
      </form>
    </div>
  );
}
