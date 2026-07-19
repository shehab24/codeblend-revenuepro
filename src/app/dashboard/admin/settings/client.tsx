"use client";
import { useTransition, useRef, useState } from "react";
import { adminSaveSettings, adminTriggerCleanup } from "./actions";

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
  paymentSettings,
  pixelSettings,
  tutorialSettings,
  currentTimerHours,
  reminderSettings,
  imagekitSettings,
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
  steadfastSettings: { apiKey: string; apiSecret: string }
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
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
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-600 mb-1">Bearer Tokens</label>
              {tokens.map((token, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={token} 
                    onChange={(e) => {
                      const newTokens = [...tokens];
                      newTokens[idx] = e.target.value;
                      setTokens(newTokens);
                    }}
                    placeholder={`Token #${idx + 1}`} 
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition font-mono"
                  />
                  {tokens.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setTokens(tokens.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2.5 rounded-xl border border-slate-200 hover:bg-red-50"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button 
                type="button" 
                onClick={() => setTokens([...tokens, ""])}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-xs hover:bg-emerald-100 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Token
              </button>
              <p className="text-xs text-slate-400 text-right max-w-xs leading-relaxed">
                If a token reaches its query limit (e.g. 50/day), gets blocked, or fails, the system automatically falls back to the next key.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Steadfast Backup API Credentials</h4>
                <p className="text-xs text-slate-400 mt-1">If all BD Courier API limits are exhausted, the system automatically queries Steadfast directly.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="steadfastApiKey">Steadfast API Key</label>
                  <input 
                    type="text" 
                    id="steadfastApiKey"
                    name="STEADFAST_API_KEY" 
                    defaultValue={steadfastSettings.apiKey}
                    placeholder="Enter Steadfast API Key" 
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="steadfastApiSecret">Steadfast Secret Key</label>
                  <input 
                    type="password" 
                    id="steadfastApiSecret"
                    name="STEADFAST_API_SECRET" 
                    defaultValue={steadfastSettings.apiSecret}
                    placeholder="Enter Steadfast Secret Key" 
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition font-mono"
                  />
                </div>
              </div>
            </div>

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

      {/* Group 5: Facebook Pixel & CAPI */}
      <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-blue-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook Pixel & CAPI
            </h3>
            <p className="text-sm text-blue-600 mt-1">Configure pixel tracking and server-side Conversions API for lead tracking.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="fbPixelId">Pixel ID</label>
            <input 
              type="text" 
              id="fbPixelId"
              name="FB_PIXEL_ID" 
              defaultValue={pixelSettings.pixelId} 
              placeholder="e.g. 123456789012345" 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="fbCapiToken">Conversions API Token</label>
            <input 
              type="password" 
              id="fbCapiToken"
              name="FB_CAPI_TOKEN" 
              defaultValue={pixelSettings.capiToken} 
              placeholder="EAAxxxxxxx..." 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="fbTestCode">Test Event Code (Optional)</label>
            <input 
              type="text" 
              id="fbTestCode"
              name="FB_TEST_EVENT_CODE" 
              defaultValue={pixelSettings.testEventCode} 
              placeholder="e.g. TEST12345" 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
            <p className="text-xs text-slate-400 mt-2">
              Use your Facebook Events Manager test code to verify events. Remove this in production.
            </p>
          </div>
        </div>
      </div>

      {/* Group 6: Tutorial Video */}
      <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-purple-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
              Tutorial Video
            </h3>
            <p className="text-sm text-purple-600 mt-1">Set a featured YouTube video and playlist link for the user Tutorials page.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="tutorialVideoUrl">YouTube Video URL</label>
            <input 
              type="url" 
              id="tutorialVideoUrl"
              name="TUTORIAL_VIDEO_URL" 
              defaultValue={tutorialSettings.videoUrl} 
              placeholder="https://www.youtube.com/watch?v=..." 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition"
            />
            <p className="text-xs text-slate-400 mt-1.5">This video will be embedded on the user Tutorials page.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="tutorialPlaylistUrl">Playlist URL</label>
            <input 
              type="url" 
              id="tutorialPlaylistUrl"
              name="TUTORIAL_PLAYLIST_URL" 
              defaultValue={tutorialSettings.playlistUrl} 
              placeholder="https://www.youtube.com/playlist?list=..." 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition"
            />
            <p className="text-xs text-slate-400 mt-1.5">"See Full Playlist" button will link here.</p>
          </div>
        </div>
      </div>

      {/* Group 7: Discounted Offer Landing Page Timer */}
      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-amber-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
              ⏱️ Discounted Offer Landing Page Timer
            </h3>
            <p className="text-sm text-amber-700 mt-1">Set the relative countdown timer duration displayed to users.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="timerHours">Countdown Timer Duration (Hours)</label>
            <input 
              type="number" 
              id="timerHours"
              name="DISCOUNTED_OFFER_TIMER_HOURS" 
              defaultValue={currentTimerHours} 
              min="1"
              placeholder="e.g. 62" 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition"
            />
            <p className="text-xs text-slate-400 mt-1.5">This represents the starting value in hours (e.g. 62 hours is 2 days and 14 hours).</p>
          </div>
        </div>
      </div>

      {/* Group 8: Inactive License Reminder Automation */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-rose-950 flex items-center gap-2">
              🔔 Inactive License Reminder Automation
            </h3>
            <p className="text-sm text-rose-700 mt-1">Automatically email users whose plugins are offline or inactive.</p>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group/toggle">
            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${reminderEnabled ? 'bg-rose-500' : 'bg-slate-300'}`}>
               <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={reminderEnabled}
              onChange={e => setReminderEnabled(e.target.checked)}
            />
            <span className={`text-xs font-bold uppercase transition-colors ${reminderEnabled ? 'text-rose-600' : 'text-slate-500'}`}>
              {reminderEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {reminderEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="reminderDays">Inactivity Trigger Period (Days)</label>
                <input 
                  type="number" 
                  id="reminderDays"
                  name="INACTIVE_REMINDER_DAYS" 
                  defaultValue={reminderSettings.days} 
                  min="1"
                  placeholder="e.g. 2" 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition"
                />
                <p className="text-xs text-slate-400 mt-1.5">Days to wait before checking if the plugin has never pinged or went offline.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="reminderSubject">Email Subject</label>
                <input 
                  type="text" 
                  id="reminderSubject"
                  name="INACTIVE_REMINDER_SUBJECT" 
                  defaultValue={reminderSettings.subject} 
                  placeholder="Verify your RevenuePro plugin settings" 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition"
                />
                <p className="text-xs text-slate-400 mt-1.5">You can use <code className="font-mono text-rose-500 bg-rose-50 px-1 rounded">{"{{domain}}"}</code> for the user's website domain.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="reminderBody">Email Content (Markdown/Plain text)</label>
              <textarea 
                id="reminderBody"
                name="INACTIVE_REMINDER_BODY" 
                defaultValue={reminderSettings.body} 
                rows={6}
                placeholder="Hi there..." 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition resize-y font-sans"
              />
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Provide custom instructions to guide them to complete their setup. You can use the placeholder <code className="font-mono text-rose-500 bg-rose-50 px-1 rounded">{"{{domain}}"}</code> in the body as well.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Group 9: ImageKit.io API Keys */}
      <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-sky-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-sky-950 flex items-center gap-2">
              🖼️ ImageKit.io CDN Configurations
            </h3>
            <p className="text-sm text-sky-700 mt-1">Provide API credentials to host client logos securely on ImageKit.io.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="imagekitPublicKey">Public Key</label>
            <input 
              type="text" 
              id="imagekitPublicKey"
              name="IMAGEKIT_PUBLIC_KEY" 
              defaultValue={imagekitSettings.publicKey} 
              placeholder="e.g. public_xxxxxxx..." 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="imagekitPrivateKey">Private Key</label>
            <input 
              type="password" 
              id="imagekitPrivateKey"
              name="IMAGEKIT_PRIVATE_KEY" 
              defaultValue={imagekitSettings.privateKey} 
              placeholder="e.g. private_xxxxxxx..." 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="imagekitUrlEndpoint">URL Endpoint</label>
            <input 
              type="text" 
              id="imagekitUrlEndpoint"
              name="IMAGEKIT_URL_ENDPOINT" 
              defaultValue={imagekitSettings.urlEndpoint} 
              placeholder="https://ik.imagekit.io/your_id" 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
            />
          </div>
        </div>
      </div>

      {/* Group 10: Database Hygiene & Maintenance */}
      <div className="bg-white rounded-2xl border border-red-250 p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-red-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-950 flex items-center gap-2">
              🧹 Database Hygiene & Maintenance
            </h3>
            <p className="text-sm text-red-600 mt-1">Manually clear expired temporary logs and sandbox payments from the database.</p>
          </div>
        </div>
        
        <div className="bg-slate-50 border border-slate-205 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Trigger Cleanup Policy</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              This will immediately delete sandbox payment records older than 3 days and MFS transaction SMS logs older than 7 days.
            </p>
          </div>
          <button
            type="button"
            disabled={isCleaning}
            onClick={handleManualCleanup}
            className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
          >
            {isCleaning ? "Purging Old Data..." : "Run Cleanup Now"}
          </button>
        </div>

        {cleanupResult && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex flex-col gap-1">
            <span>✨ Database cleanup ran successfully!</span>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>Purged {cleanupResult.deletedSandbox} sandbox payment records (older than 3 days)</li>
              <li>Purged {cleanupResult.deletedSms} MFS SMS log records (older than 7 days)</li>
            </ul>
          </div>
        )}
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
