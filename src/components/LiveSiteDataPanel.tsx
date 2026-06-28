"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowPathIcon, 
  ShoppingBagIcon, 
  CurrencyBangladeshiIcon, 
  ShieldCheckIcon,
  ShoppingCartIcon,
  ServerIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export function LiveSiteDataPanel({ 
  licenseId, 
  domain, 
  initialData = null 
}: { 
  licenseId: string; 
  domain: string;
  initialData?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string; wp_error?: string } | null>(null);
  const [data, setData] = useState<any>(initialData?.data || null);
  const [pulledAt, setPulledAt] = useState<string>(initialData?.pulled_at || "");
  const [needsSetup, setNeedsSetup] = useState(false);

  const pullData = async () => {
    setLoading(true);
    setError(null);
    setNeedsSetup(false);
    try {
      const res = await fetch(`/api/v1/license/site-data?license_id=${licenseId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPulledAt(json.pulled_at);
        setNeedsSetup(false);
      } else if (json.error?.includes("No site token")) {
        // Show friendly setup guide instead of scary error
        setNeedsSetup(true);
      } else {
        setError({ message: json.error || "Failed to pull data", details: json.details, wp_error: json.wp_error });
      }
    } catch (err) {
      setError({ message: "Network error. Could not reach server." });
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync on mount if no cached data exists
  useEffect(() => {
    if (!initialData?.data && !data) {
      // Check if a token exists before attempting auto-sync
      const checkAndSync = async () => {
        try {
          const res = await fetch(`/api/v1/license/site-data?license_id=${licenseId}&check_only=true`);
          const json = await res.json();
          if (json.success) {
            setData(json.data);
            setPulledAt(json.pulled_at);
          } else if (json.error?.includes("No site token")) {
            // Don't show error — show setup guide instead
            setError(null);
            setNeedsSetup(true);
          } else {
            // Real sync error
            setError({ message: json.error || "Failed to pull data", details: json.details, wp_error: json.wp_error });
          }
        } catch {
          // Network error — silently fail on auto-sync
        }
      };
      const timer = setTimeout(checkAndSync, 1000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': 
      case 'on-hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': 
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-6">
      {/* Header Area */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ServerIcon className="w-6 h-6 text-indigo-600" />
            Live Store Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time data synced from <span className="font-semibold text-slate-700">{domain}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {pulledAt && (
            <div className="text-xs text-slate-400 text-right hidden sm:block">
              <div>Last Synced</div>
              <div className="font-medium">{new Date(pulledAt).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</div>
            </div>
          )}
          <button
            onClick={pullData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="flex-1 min-w-0">
            <span className="font-semibold block mb-1">Sync Error</span>
            <p>{error.message}</p>
            {error.details && (
              <p className="mt-2 text-red-500 text-xs leading-relaxed">{error.details}</p>
            )}
            {error.wp_error && (
              <pre className="mt-2 p-2 bg-red-100 rounded-lg text-[11px] text-red-700 font-mono whitespace-pre-wrap break-all">{error.wp_error}</pre>
            )}
          </div>
        </div>
      )}

      {!data && !error && !loading && !needsSetup && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ServerIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">No Data Available Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click the sync button above to fetch the latest analytics and transactions directly from your WordPress store.
          </p>
        </div>
      )}

      {needsSetup && !data && (
        <div className="p-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 mb-2">Plugin Setup Required</h3>
                <p className="text-sm text-amber-800 leading-relaxed mb-3">
                  Your WordPress plugin needs to verify the license first. Go to your WordPress Dashboard:
                </p>
                <ol className="text-sm text-amber-700 space-y-1.5 list-decimal list-inside">
                  <li>Navigate to <strong>RevenuePro → Settings</strong></li>
                  <li>Enter your License Key and Account Email</li>
                  <li>Click <strong>"Check License"</strong> or <strong>"Save Settings"</strong></li>
                </ol>
                <p className="text-xs text-amber-600 mt-3">Once verified, come back and click "Sync Now" to pull live data.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Establishing secure connection to {domain}...</p>
        </div>
      )}

      {data && (
        <div className={`p-6 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          
          {/* Top Metrics Grid */}
          {data.stats && (
            <div className="space-y-4 mb-8">
              {/* Primary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-sm">
                      <CurrencyBangladeshiIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-900">Total Revenue</h4>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    ৳{(Number(data.stats.total_revenue) || Number(data.stats.total_bkash_sales) || 0).toLocaleString()}
                  </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg text-white shadow-sm">
                      <ShoppingBagIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-blue-900">Total Orders</h4>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-black text-blue-700">
                      {data.stats.total_orders || 0}
                    </div>
                    {data.stats.pending_orders > 0 && (
                      <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                        {data.stats.pending_orders} Pending
                      </div>
                    )}
                  </div>
                </div>

                {/* Fraud Card */}
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-5 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-500 rounded-lg text-white shadow-sm">
                      <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-rose-900">Fraud Prevented</h4>
                  </div>
                  <div className="text-2xl font-black text-rose-700">
                    {data.stats.fraud_entries || 0} <span className="text-sm font-semibold opacity-70">Numbers</span>
                  </div>
                </div>

                {/* Abandoned Cart Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-sm">
                      <ShoppingCartIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-indigo-900">Cart Recovery</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-black text-indigo-700">{data.stats.recovered_carts || 0}</div>
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Recovered</div>
                    </div>
                    <div className="h-8 w-px bg-indigo-200"></div>
                    <div>
                      <div className="text-xl font-bold text-slate-500">{data.stats.abandoned_carts || 0}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Abandoned</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Breakdown Row */}
              {(data.stats.total_bkash_orders > 0 || data.stats.total_cod_orders > 0 || data.stats.total_other_orders > 0) && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-pink-50 border border-pink-100 rounded-xl p-3.5 text-center">
                    <div className="text-lg font-black text-pink-700">৳{(Number(data.stats.total_bkash_sales) || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mt-1">bKash ({data.stats.total_bkash_orders || 0})</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-center">
                    <div className="text-lg font-black text-amber-700">৳{(Number(data.stats.total_cod_sales) || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">COD ({data.stats.total_cod_orders || 0})</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                    <div className="text-lg font-black text-slate-700">৳{(Number(data.stats.total_other_sales) || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Other ({data.stats.total_other_orders || 0})</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Transactions — Full Width */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-slate-400" />
              Recent Transactions
            </h3>
            
            {data.recent_transactions && data.recent_transactions.length > 0 ? (
              <div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Order</th>
                          <th className="px-4 py-3 font-semibold">Customer</th>
                          <th className="px-4 py-3 font-semibold text-right">Amount</th>
                          <th className="px-4 py-3 font-semibold text-center">Payment</th>
                          <th className="px-4 py-3 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.recent_transactions.slice(0, 5).map((trx: any, i: number) => {
                          const methodColor = trx.payment_method === 'bKash' 
                            ? 'bg-pink-50 text-pink-700 border-pink-200' 
                            : trx.payment_method === 'COD' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200';
                          return (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-800">#{trx.order_number || trx.order_id}</div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">{trx.trx_id || "—"}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-700">{trx.customer || "Guest"}</div>
                                <div className="text-xs text-slate-500">{trx.phone || "No phone"}</div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="font-bold text-slate-800">৳{(Number(trx.amount) || 0).toLocaleString()}</div>
                                {trx.utm_source && (
                                  <div className="text-[10px] font-bold text-indigo-500 mt-0.5">via {trx.utm_source}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${methodColor}`}>
                                  {trx.payment_method || trx.payment_type || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(trx.status)}`}>
                                  {trx.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {data.recent_transactions.length > 5 && (
                  <Link 
                    href={`/dashboard/user/revenuepro/${licenseId}/orders`}
                    className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all"
                  >
                    View All Orders
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-500 text-sm">
                No recent transactions found on the store.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
