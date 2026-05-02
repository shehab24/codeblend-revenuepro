"use client";
import { useTransition } from "react";
import { submitAuthenticatedServiceRequest } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ServiceRequestFormInner() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  
  const defaultType = searchParams.get("type") === "feature" ? "RevenuePro Feature Request" : "";

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await submitAuthenticatedServiceRequest(formData);
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
          defaultValue={defaultType}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition appearance-none"
        >
          <option value="" disabled>Select a service...</option>
          <option value="Custom WordPress Plugin">Custom WordPress Plugin</option>
          <option value="WooCommerce Customization">WooCommerce Customization</option>
          <option value="Shopify App Development">Shopify App Development</option>
          <option value="API Integration & Automation">API Integration & Automation</option>
          <option value="RevenuePro Dedicated Setup">RevenuePro Dedicated Setup</option>
          <option value="RevenuePro Feature Request">RevenuePro Feature Request</option>
          <option value="Other / Custom Request">Other / Custom Request</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="websiteUrl">
          Website URL (Optional)
        </label>
        <input 
          type="url"
          id="websiteUrl"
          name="websiteUrl"
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="message">
          Project Requirements & Details
        </label>
        <textarea 
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Please describe your requirements, goals, and any specific features you need..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition resize-y"
        />
        <p className="text-xs text-slate-500 mt-2">
          The more details you provide, the faster we can process your request and set up an accurate invoice.
        </p>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20"
      >
        {isPending ? "Submitting Request..." : "Submit Service Request"}
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
