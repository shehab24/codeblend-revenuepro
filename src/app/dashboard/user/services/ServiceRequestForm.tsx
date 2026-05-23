"use client";
import { useTransition, useState } from "react";
import { submitAuthenticatedServiceRequest } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { trackFBEvent } from "@/components/FacebookPixel";

const FREE_TRIAL_TYPES = ["Free Trial"];

function ServiceRequestFormInner() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") === "feature" ? "RevenuePro Feature Request" :
                      searchParams.get("type") === "trial"   ? "Free Trial" : "";

  const [serviceType, setServiceType] = useState(defaultType);
  const isFreeTrial = FREE_TRIAL_TYPES.includes(serviceType);

  const handleSubmit = (formData: FormData) => {
    const svc = formData.get("serviceType") as string;
    startTransition(async () => {
      await submitAuthenticatedServiceRequest(formData);
      trackFBEvent("Lead", {
        content_name: svc || "Service Request",
        content_category: "Authenticated Service Request",
      });
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="serviceType">
          Which service do you need?
        </label>
        <select
          id="serviceType"
          name="serviceType"
          required
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition appearance-none"
        >
          <option value="" disabled>Select a service...</option>
          <option value="Free Trial">🆓 Free Trial</option>
          <option value="Monthly Plan">📅 Monthly Plan</option>
          <option value="Quarterly Plan">📦 Quarterly Plan</option>
          <option value="Custom WordPress Plugin">Custom WordPress Plugin</option>
          <option value="WooCommerce Customization">WooCommerce Customization</option>
          <option value="Shopify App Development">Shopify App Development</option>
          <option value="API Integration & Automation">API Integration &amp; Automation</option>
          <option value="RevenuePro Dedicated Setup">RevenuePro Dedicated Setup</option>
          <option value="RevenuePro Feature Request">RevenuePro Feature Request</option>
          <option value="Other / Custom Request">Other / Custom Request</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="websiteUrl">
          Website URL {isFreeTrial ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
        </label>
        {isFreeTrial && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2 font-medium">
            ⚠️ A website URL is required to activate the free trial on your store.
          </p>
        )}
        <input
          type="url"
          id="websiteUrl"
          name="websiteUrl"
          required={isFreeTrial}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="message">
          {isFreeTrial ? "Tell us about your store" : "Project Requirements & Details"}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={isFreeTrial
            ? "Briefly describe your store, what products you sell, and what you hope to achieve with the free trial..."
            : "Please describe your requirements, goals, and any specific features you need..."}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">
          {isFreeTrial
            ? "Our team will review your application and set up the trial on your site."
            : "The more details you provide, the faster we can process your request and set up an accurate invoice."}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20"
      >
        {isPending ? "Submitting..." : isFreeTrial ? "Apply for Free Trial" : "Submit Service Request"}
      </button>
    </form>
  );
}

export function ServiceRequestForm() {
  return (
    <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400">Loading form...</div>}>
      <ServiceRequestFormInner />
    </Suspense>
  );
}


