"use client";

import { useState, useEffect } from "react";
import { 
  ArrowPathIcon, 
  ShoppingBagIcon, 
  CurrencyBangladeshiIcon, 
  ShieldCheckIcon,
  ShoppingCartIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
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
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(initialData?.data || null);
  const [pulledAt, setPulledAt] = useState<string>(initialData?.pulled_at || "");

  const pullData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/license/site-data?license_id=${licenseId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPulledAt(json.pulled_at);
      } else {
        setError(json.error || "Failed to pull data");
      }
    } catch (err) {
      setError("Network error. Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

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
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-1">Sync Error</span>
            {error}
          </div>
        </div>
      )}

      {!data && !error && !loading && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Sales Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-sm">
                    <CurrencyBangladeshiIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">Total bKash Sales</h4>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  ৳{(Number(data.stats.total_bkash_sales) || 0).toLocaleString()}
                </div>
              </div>

              {/* Orders Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg text-white shadow-sm">
                    <ShoppingBagIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-blue-900">bKash Orders</h4>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-black text-blue-700">
                    {data.stats.total_bkash_orders || data.stats.total_orders || 0}
                  </div>
                  {data.stats.pending_orders > 0 && (
                    <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
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
          )}

          {/* Bottom Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Recent Transactions */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-slate-400" />
                Recent bKash Transactions
              </h3>
              
              {data.recent_transactions && data.recent_transactions.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Order</th>
                          <th className="px-4 py-3 font-semibold">Customer</th>
                          <th className="px-4 py-3 font-semibold text-right">Amount</th>
                          <th className="px-4 py-3 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.recent_transactions.map((trx: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">#{trx.order_number || trx.order_id}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{trx.trx_id || "No TrxID"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-700">{trx.customer || "Guest"}</div>
                              <div className="text-xs text-slate-500">{trx.phone || "No phone"}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-bold text-slate-800">৳{(Number(trx.amount) || 0).toLocaleString()}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">{trx.payment_type || 'API'}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(trx.status)}`}>
                                {trx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-500 text-sm">
                  No recent transactions found on the store.
                </div>
              )}
            </div>

            {/* Right Col: System Info */}
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                System Health
              </h3>
              
              {data.site_info || data.site ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  
                  {/* WP Version */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm font-semibold text-slate-600">WordPress</span>
                    <span className="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      v{(data.site_info || data.site).wp_version || 'Unknown'}
                    </span>
                  </div>

                  {/* WC Version */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm font-semibold text-slate-600">WooCommerce</span>
                    <span className="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      v{(data.site_info || data.site).wc_version || 'Unknown'}
                    </span>
                  </div>

                  {/* Plugin Version */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm font-semibold text-slate-600">RevenuePro</span>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      v{(data.site_info || data.site).plugin_version || 'Unknown'}
                    </span>
                  </div>

                  {/* PHP Version */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-sm font-semibold text-slate-600">PHP Version</span>
                    <span className="text-sm font-bold text-slate-800">
                      {(data.site_info || data.site).php_version || 'Unknown'}
                    </span>
                  </div>

                  {/* Payment Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">bKash Mode</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md uppercase tracking-wider">
                      {(data.site_info || data.site).payment_mode || 'Automated'}
                    </span>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-500 text-sm">
                  System info unavailable.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
