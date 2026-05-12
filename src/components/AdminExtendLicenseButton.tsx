"use client";

import { useTransition, useState } from "react";
import { adminExtendLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminExtendLicenseButton({ licenseId, currentTier }: { licenseId: string; currentTier: string }) {
  const [showModal, setShowModal] = useState(false);
  const [extending, startExtend] = useTransition();
  const [success, setSuccess] = useState(false);

  return (
    <>
      <button
        onClick={() => { setShowModal(true); setSuccess(false); }}
        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Extend / Renew Expiry
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Extend License Expiry
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 p-1 text-lg">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Tier</div>
                <div className="text-sm font-semibold text-slate-800">{currentTier}</div>
                <div className="text-xs text-slate-500 mt-1">The license key will remain unchanged. Only the expiry date and tier will update.</div>
              </div>

              {success ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <div className="text-lg font-bold text-emerald-700 mb-1">✅ License Extended!</div>
                  <p className="text-sm text-emerald-600">The expiration date and tier have been updated. The plugin will auto-detect this on the next daily cron check.</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form action={(formData) => {
                  const duration = formData.get('duration') as string;
                  startExtend(async () => {
                    await adminExtendLicense(licenseId, duration);
                    setSuccess(true);
                  });
                }}>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Duration (from today)</label>
                    <select
                      name="duration"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition appearance-none"
                    >
                      <option value="1_day">1 Day (Short Trial)</option>
                      <option value="5_day">5 Days (Trial)</option>
                      <option value="15">15 Days (Trial)</option>
                      <option value="1">1 Month (Basic)</option>
                      <option value="2">2 Months (Extended)</option>
                      <option value="3">3 Months (Quarterly)</option>
                      <option value="6">6 Months (Biannual)</option>
                      <option value="12">1 Year (Elite)</option>
                      <option value="0">Lifetime (Never Expires)</option>
                    </select>
                  </div>

                  <button 
                    disabled={extending}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {extending ? "Extending..." : "Extend License Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
