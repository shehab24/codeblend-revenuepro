"use client";
import { useTransition, useRef, useState } from "react";
import { adminSaveSettings } from "./actions";

export type PluginVersion = {
  id: string; // for React keys
  version: string;
  name: string;
  link: string;
  isLatest: boolean;
};

export function AdminSettingsClient({ 
  currentKey, 
  currentAlertEmail, 
  currentRevenueProLinks,
  paymentSettings 
}: { 
  currentKey: string, 
  currentAlertEmail: string, 
  currentRevenueProLinks: PluginVersion[],
  paymentSettings: any 
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialMode = paymentSettings.bkashApiEnabled === "true" ? "api" 
                    : paymentSettings.bkashManualEnabled === "true" ? "manual" 
                    : "none";
  const [activePaymentMode, setActivePaymentMode] = useState<"api" | "manual" | "none">(initialMode);

  const [links, setLinks] = useState<PluginVersion[]>(
    currentRevenueProLinks.length > 0 ? currentRevenueProLinks : [{
      id: "default",
      version: "1.0.0",
      name: "Revenue Pro - Latest Build",
      link: "",
      isLatest: true
    }]
  );

  const handleSubmit = (formData: FormData) => {
    formData.append("revenueProPluginLinks", JSON.stringify(links));
    startTransition(async () => {
      await adminSaveSettings(formData);
    });
  };

  const addLink = () => {
    setLinks([...links, {
      id: Math.random().toString(36).substring(7),
      version: "",
      name: "Revenue Pro - Older Build",
      link: "",
      isLatest: false
    }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const updateLink = (id: string, field: keyof PluginVersion, value: any) => {
    setLinks(links.map(l => {
      if (l.id === id) {
        // If we're setting this one as latest, make others false
        if (field === "isLatest" && value === true) {
           return { ...l, [field]: value };
        }
        return { ...l, [field]: value };
      } else {
        // Unset latest on others if this one is latest
        if (field === "isLatest" && value === true) {
          return { ...l, isLatest: false };
        }
        return l;
      }
    }));
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Group 1: API Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div className="mb-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">BD Courier API Integration</h3>
              <p className="text-sm text-slate-400 mt-1">Configure your primary courier polling authentication token.</p>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="bdCourierApiKey">Bearer Token</label>
            <input 
              type="text" 
              id="bdCourierApiKey"
              name="bdCourierApiKey" 
              defaultValue={currentKey} 
              placeholder="e.g. 521c7a8b9f..." 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
            />
          </div>
        </div>

        {/* Group 2: Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div className="mb-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">System Notifications</h3>
              <p className="text-sm text-slate-400 mt-1">Manage where administrative alerts are sent.</p>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="adminAlertEmail">Primary Alert Email</label>
            <input 
              type="email" 
              id="adminAlertEmail"
              name="adminAlertEmail" 
              defaultValue={currentAlertEmail} 
              placeholder="admin@example.com" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
            />
            <p className="text-xs text-slate-400 mt-2">
              This email will receive notifications when new leads, licenses, or service requests are submitted.
            </p>
          </div>
        </div>
      </div>

      {/* Group 3: Payment Configuration */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-emerald-900">Payment Gateway Settings</h3>
            <p className="text-sm text-emerald-600 mt-1">Select and configure your active payment method.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              type="button" 
              onClick={() => setActivePaymentMode("none")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${activePaymentMode === "none" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
            >
              None
            </button>
            <button 
              type="button" 
              onClick={() => setActivePaymentMode("manual")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${activePaymentMode === "manual" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              Manual bKash
            </button>
            <button 
              type="button" 
              onClick={() => setActivePaymentMode("api")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${activePaymentMode === "api" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              bKash API
            </button>
          </div>
        </div>

        <input type="hidden" name="BKASH_MANUAL_ENABLED" value={activePaymentMode === "manual" ? "true" : "false"} />
        <input type="hidden" name="BKASH_API_ENABLED" value={activePaymentMode === "api" ? "true" : "false"} />

        <div className="space-y-6">
          {/* bKash Manual */}
          {activePaymentMode === "manual" && (
            <div className="p-4 bg-slate-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  bKash Manual Configuration
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">bKash Number</label>
                  <input type="text" name="BKASH_MANUAL_NUMBER" defaultValue={paymentSettings.bkashManualNumber} className="w-full px-3 py-2 rounded-lg border border-slate-200" placeholder="e.g. 01700000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Account Type</label>
                  <select name="BKASH_MANUAL_TYPE" defaultValue={paymentSettings.bkashManualType} className="w-full px-3 py-2 rounded-lg border border-slate-200">
                    <option value="personal">Personal (Send Money)</option>
                    <option value="merchant">Merchant (Payment)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* bKash API */}
          {activePaymentMode === "api" && (
            <div className="p-4 bg-slate-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  bKash API Configuration
                </h4>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">App Key</label>
                <input type="text" name="BKASH_API_APP_KEY" defaultValue={paymentSettings.bkashApiAppKey} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">App Secret</label>
                <input type="password" name="BKASH_API_APP_SECRET" defaultValue={paymentSettings.bkashApiAppSecret} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                <input type="text" name="BKASH_API_USERNAME" defaultValue={paymentSettings.bkashApiUsername} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                <input type="password" name="BKASH_API_PASSWORD" defaultValue={paymentSettings.bkashApiPassword} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Group 4: Plugin Download Links */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-emerald-900">RevenuePro Distribution Center</h3>
            <p className="text-sm text-emerald-600 mt-1">Manage plugin versions presented to subscribers.</p>
          </div>
          <button 
            type="button" 
            onClick={addLink}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-xs hover:bg-emerald-100 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Version
          </button>
        </div>

        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={link.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-3 group transition-all focus-within:border-emerald-400 focus-within:bg-white">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Title</label>
                  <input 
                    type="text" 
                    value={link.name} 
                    onChange={e => updateLink(link.id, 'name', e.target.value)}
                    placeholder="e.g. Revenue Pro - Stable" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="w-24 shrink-0">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Version</label>
                  <input 
                    type="text" 
                    value={link.version} 
                    onChange={e => updateLink(link.id, 'version', e.target.value)}
                    placeholder="v1.0.0" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Download Link (e.g. Google Drive URL)</label>
                <input 
                  type="url" 
                  value={link.link} 
                  onChange={e => updateLink(link.id, 'link', e.target.value)}
                  placeholder="https://drive.google.com/..." 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer group/toggle">
                  <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${link.isLatest ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${link.isLatest ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={link.isLatest}
                    onChange={e => updateLink(link.id, 'isLatest', e.target.checked)}
                  />
                  <span className={`text-xs font-bold uppercase transition-colors ${link.isLatest ? 'text-emerald-600' : 'text-slate-500'}`}>
                    Mark as Latest Release
                  </span>
                </label>
                
                {links.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLink(link.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded-md hover:bg-red-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 sticky bottom-6 z-10 flex justify-end">
        <button 
          type="submit" 
          onClick={(e) => { e.preventDefault(); formRef.current?.requestSubmit(); }}
          disabled={isPending}
          className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10 hover:shadow-emerald-500/20"
        >
          {isPending ? "Validating & Saving Context..." : "Deploy Configuration Updates"}
        </button>
      </div>
    </form>
  );
}
