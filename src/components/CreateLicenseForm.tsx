"use client";

import { useTransition } from "react";
import { createLicense } from "@/app/dashboard/user/actions";

export function CreateLicenseForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createLicense(formData);
      (document.getElementById("license-form") as HTMLFormElement).reset();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="mb-4 pb-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">প্লাগইনের জন্য আবেদন করুন</h3>
        <p className="text-sm text-slate-400 mt-1">আপনার ওয়েবসাইটের ডোমেইন দিয়ে লাইসেন্স তৈরি করুন।</p>
      </div>
      <form id="license-form" action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="domain">ওয়েবসাইটের ডোমেইন (Target Domain)</label>
          <input
            type="text"
            id="domain"
            name="domain"
            placeholder="e.g., ecomdrivebd.com"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="duration">সাবস্ক্রিপশনের মেয়াদ (Duration)</label>
          <select
            id="duration"
            name="duration"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition appearance-none"
          >
            <option value="1">১ মাস (1 Month)</option>
            <option value="2">২ মাস (2 Months)</option>
            <option value="3">৩ মাস (3 Months)</option>
            <option value="6">৬ মাস (6 Months)</option>
            <option value="12">১ বছর (1 Year)</option>
            <option value="0">আজীবন (Lifetime)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
        >
          {isPending ? "আবেদন করা হচ্ছে..." : "সাবস্ক্রিপশনের জন্য আবেদন করুন"}
        </button>
      </form>
    </div>
  );
}
