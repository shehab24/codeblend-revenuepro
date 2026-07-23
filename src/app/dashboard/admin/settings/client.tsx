"use client";

import { useTransition, useRef, useState } from "react";
import { adminSaveSettings, adminTriggerCleanup } from "./actions";

export type PluginVersion = {
  id: string;
  version: string;
  name: string;
  link: string;
  isLatest: boolean;
};

type TabType = "couriers" | "payments" | "plugins" | "analytics" | "notifications" | "media" | "promos" | "maintenance";

export function AdminSettingsClient({ 
  currentKey, 
  currentAlertEmail, 
  currentRevenueProLinks,
  paymentSettings,
  pixelSettings,
  tutorialSettings,
  currentTimerHours,
  reminderSettings,
  imagekitSettings,
  pathaoSettings,
  steadfastSettings
}: { 
  currentKey: string, 
  currentAlertEmail: string, 
  currentRevenueProLinks: PluginVersion[],
  paymentSettings: any,
  pixelSettings: { pixelId: string; capiToken: string; testEventCode: string },
  tutorialSettings: { videoUrl: string; playlistUrl: string },
  currentTimerHours: string,
  reminderSettings: { enabled: string; days: string; subject: string; body: string },
  imagekitSettings: { publicKey: string; privateKey: string; urlEndpoint: string },
  pathaoSettings: { clientId: string; clientSecret: string },
  steadfastSettings: { apiKey: string; apiSecret: string }
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("couriers");
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ deletedSandbox: number, deletedSms: number } | null>(null);

  const handleManualCleanup = async () => {
    if (!confirm("Are you sure you want to trigger database cleanup? This will permanently delete old logs.")) return;
    setIsCleaning(true);
    setCleanupResult(null);
    try {
      const res = await adminTriggerCleanup();
      setCleanupResult({ deletedSandbox: res.deletedSandbox, deletedSms: res.deletedSms });
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to trigger cleanup"));
    } finally {
      setIsCleaning(false);
    }
  };
  
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

  const [tokens, setTokens] = useState<string[]>(
    currentKey ? currentKey.split(/[\n,;]+/).map(k => k.trim()).filter(Boolean) : [""]
  );

  const [reminderEnabled, setReminderEnabled] = useState(reminderSettings.enabled === "true");

  const handleSubmit = (formData: FormData) => {
    formData.append("revenueProPluginLinks", JSON.stringify(links));
    const activeTokens = tokens.map(t => t.trim()).filter(Boolean);
    formData.append("bdCourierApiKey", activeTokens.join("\n"));
    formData.append("INACTIVE_REMINDER_ENABLED", reminderEnabled ? "true" : "false");
    
    startTransition(async () => {
      await adminSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
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
        if (field === "isLatest" && value === true) {
           return { ...l, [field]: value };
        }
        return { ...l, [field]: value };
      } else {
        if (field === "isLatest" && value === true) {
           return { ...l, isLatest: false };
        }
        return l;
      }
    }));
  };

  const tabs = [
    { id: "couriers", label: "Courier APIs" },
    { id: "payments", label: "Payment Gateway" },
    { id: "plugins", label: "Plugin Downloads" },
    { id: "analytics", label: "Facebook Pixel" },
    { id: "notifications", label: "Alerts & Emails" },
    { id: "media", label: "ImageKit CDN" },
    { id: "promos", label: "Offers & Tutorials" },
    { id: "maintenance", label: "Maintenance" }
  ];

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 font-sans text-slate-800">
      
      {/* Page Title & Header Actions (No double-dashboard panels) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure courier authentication API keys, payment options, analytics pixels, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-fade-in">
              ✓ Saved
            </span>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Flat Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 bg-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Pane */}
      <div className="max-w-4xl">
        
        {/* TAB: COURIER APIS */}
        {activeTab === "couriers" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Courier API Integrations
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure primary and failover keys for 3-tiered fraud check queries.
              </p>
            </div>

            {/* BD Courier API Keys */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  1. BD Courier Bearer Tokens (Primary)
                </label>
                <span className="text-[10px] text-slate-400">Rotates if limits expire</span>
              </div>

              <div className="space-y-2">
                {tokens.map((token, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-[11px] font-mono text-slate-400 w-10 shrink-0">#{idx + 1}</span>
                    <input 
                      type="text" 
                      value={token} 
                      onChange={(e) => {
                        const newTokens = [...tokens];
                        newTokens[idx] = e.target.value;
                        setTokens(newTokens);
                      }}
                      placeholder="Bearer token" 
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                    {tokens.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setTokens(tokens.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={() => setTokens([...tokens, ""])}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
              >
                + Add Token
              </button>
            </div>

            {/* Pathao Backup API */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  2. Pathao Backup API (First Failover)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Failover option when BD Courier tokens are restricted or hit daily limits.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1" htmlFor="pathaoClientId">
                    Pathao Client ID
                  </label>
                  <input 
                    type="text" 
                    id="pathaoClientId"
                    name="PATHAO_CLIENT_ID" 
                    defaultValue={pathaoSettings.clientId}
                    placeholder="Enter Client ID" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1" htmlFor="pathaoClientSecret">
                    Pathao Client Secret
                  </label>
                  <input 
                    type="password" 
                    id="pathaoClientSecret"
                    name="PATHAO_CLIENT_SECRET" 
                    defaultValue={pathaoSettings.clientSecret}
                    placeholder="Enter Client Secret" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Steadfast Backup API */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  3. Steadfast Backup API (Second Failover)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Failover queried when both BD Courier and Pathao API connections fail.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1" htmlFor="steadfastApiKey">
                    Steadfast API Key
                  </label>
                  <input 
                    type="text" 
                    id="steadfastApiKey"
                    name="STEADFAST_API_KEY" 
                    defaultValue={steadfastSettings.apiKey}
                    placeholder="Enter API Key" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1" htmlFor="steadfastApiSecret">
                    Steadfast Secret Key
                  </label>
                  <input 
                    type="password" 
                    id="steadfastApiSecret"
                    name="STEADFAST_API_SECRET" 
                    defaultValue={steadfastSettings.apiSecret}
                    placeholder="Enter Secret Key" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAYMENT GATEWAY */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                bKash Payment Gateways
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Select your preference for merchant invoice settlements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActivePaymentMode("manual")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  activePaymentMode === "manual"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-xs">📱 Manual bKash</div>
                <div className="text-[10px] opacity-80 mt-1">Merchant enters TrxID manually</div>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentMode("api")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  activePaymentMode === "api"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-xs">⚡ Automated API</div>
                <div className="text-[10px] opacity-80 mt-1">bKash Checkout API token flow</div>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentMode("none")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  activePaymentMode === "none"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-xs">🚫 Disabled</div>
                <div className="text-[10px] opacity-80 mt-1">Disable all checkout checkout routes</div>
              </button>
            </div>

            <input type="hidden" name="BKASH_MANUAL_ENABLED" value={activePaymentMode === "manual" ? "true" : "false"} />
            <input type="hidden" name="BKASH_API_ENABLED" value={activePaymentMode === "api" ? "true" : "false"} />

            {activePaymentMode === "manual" && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fade-in">
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Manual Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">bKash Number</label>
                    <input
                      type="text"
                      name="BKASH_MANUAL_NUMBER"
                      defaultValue={paymentSettings.bkashManualNumber}
                      placeholder="01700000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Account Type</label>
                    <select
                      name="BKASH_MANUAL_TYPE"
                      defaultValue={paymentSettings.bkashManualType}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    >
                      <option value="personal">Personal (Send Money)</option>
                      <option value="merchant">Merchant (Payment)</option>
                      <option value="agent">Agent (Cash In)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activePaymentMode === "api" && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fade-in">
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">checkout api credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">App Key</label>
                    <input
                      type="text"
                      name="BKASH_API_APP_KEY"
                      defaultValue={paymentSettings.bkashApiAppKey}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">App Secret</label>
                    <input
                      type="password"
                      name="BKASH_API_APP_SECRET"
                      defaultValue={paymentSettings.bkashApiAppSecret}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Username</label>
                    <input
                      type="text"
                      name="BKASH_API_USERNAME"
                      defaultValue={paymentSettings.bkashApiUsername}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
                    <input
                      type="password"
                      name="BKASH_API_PASSWORD"
                      defaultValue={paymentSettings.bkashApiPassword}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PLUGIN DOWNLOADS */}
        {activeTab === "plugins" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Plugin Version Releases
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Manage active builds available for merchant user downloads.
                </p>
              </div>
              <button
                type="button"
                onClick={addLink}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer"
              >
                + Add Release Build
              </button>
            </div>

            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Version</label>
                      <input
                        type="text"
                        value={link.version}
                        onChange={(e) => updateLink(link.id, "version", e.target.value)}
                        placeholder="e.g. 2.1.0"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Release Title</label>
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => updateLink(link.id, "name", e.target.value)}
                        placeholder="RevenuePro Stable"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Zip URL</label>
                      <input
                        type="text"
                        value={link.link}
                        onChange={(e) => updateLink(link.id, "link", e.target.value)}
                        placeholder="https://..."
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="latest_version_radio"
                        checked={link.isLatest}
                        onChange={() => updateLink(link.id, "isLatest", true)}
                        className="accent-emerald-600"
                      />
                      <span>Active Latest Stable Build</span>
                    </label>
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                      >
                        Delete Build
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS & PIXEL */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Facebook Pixel Config
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure Facebook event conversion APIs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pixel ID</label>
                <input
                  type="text"
                  name="FB_PIXEL_ID"
                  defaultValue={pixelSettings.pixelId}
                  placeholder="Pixel ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">CAPI Token</label>
                <input
                  type="password"
                  name="FB_CAPI_TOKEN"
                  defaultValue={pixelSettings.capiToken}
                  placeholder="Access Token"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Test Event Code</label>
                <input
                  type="text"
                  name="FB_TEST_EVENT_CODE"
                  defaultValue={pixelSettings.testEventCode}
                  placeholder="TEST..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS & REMINDERS */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Alert Email Settings
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Manage email reminders and notification recipients.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">System Alerts Recipient</label>
              <input
                type="email"
                name="ADMIN_ALERT_EMAIL"
                defaultValue={currentAlertEmail}
                placeholder="contact@codeblend.co"
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              />
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Inactive Reminders</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Send alerts if merchant servers stop logging orders.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>Reminders Active</span>
                </label>
              </div>

              {reminderEnabled && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trigger Limit (Days)</label>
                    <input
                      type="number"
                      name="INACTIVE_REMINDER_DAYS"
                      defaultValue={reminderSettings.days}
                      min="1"
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
                    <input
                      type="text"
                      name="INACTIVE_REMINDER_SUBJECT"
                      defaultValue={reminderSettings.subject}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Body Template</label>
                    <textarea
                      name="INACTIVE_REMINDER_BODY"
                      rows={4}
                      defaultValue={reminderSettings.body}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: IMAGEKIT CDN */}
        {activeTab === "media" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                ImageKit storage
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure ImageKit integration keys.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Public Key</label>
                <input
                  type="text"
                  name="IMAGEKIT_PUBLIC_KEY"
                  defaultValue={imagekitSettings.publicKey}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Private Key</label>
                <input
                  type="password"
                  name="IMAGEKIT_PRIVATE_KEY"
                  defaultValue={imagekitSettings.privateKey}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                  placeholder="Private Key"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">URL Endpoint</label>
                <input
                  type="text"
                  name="IMAGEKIT_URL_ENDPOINT"
                  defaultValue={imagekitSettings.urlEndpoint}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROMOS & PLAYLISTS */}
        {activeTab === "promos" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Offers & Tutorial playlists
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure user settings for tutorial resources.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Offer Timer (Hours)</label>
                <input
                  type="number"
                  name="DISCOUNTED_OFFER_TIMER_HOURS"
                  defaultValue={currentTimerHours}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Video link</label>
                <input
                  type="text"
                  name="TUTORIAL_VIDEO_URL"
                  defaultValue={tutorialSettings.videoUrl}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Playlist Link</label>
                <input
                  type="text"
                  name="TUTORIAL_PLAYLIST_URL"
                  defaultValue={tutorialSettings.playlistUrl}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM MAINTENANCE */}
        {activeTab === "maintenance" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                System Database Cleanups
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Reclaim storage capacity by purging transient entries.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-850 text-xs">Purge Sandbox Payments & SMS Logs</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg leading-relaxed">
                  Permanently cleans payments older than 3 days and SMS sync records older than 7 days.
                </p>
              </div>

              <button
                type="button"
                onClick={handleManualCleanup}
                disabled={isCleaning}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50 border-none"
              >
                {isCleaning ? "Executing..." : "Purge Temp Logs"}
              </button>
            </div>

            {cleanupResult && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                ✓ Cleanup done. Removed {cleanupResult.deletedSandbox} sandbox logs and {cleanupResult.deletedSms} SMS logs.
              </div>
            )}
          </div>
        )}

      </div>

    </form>
  );
}
