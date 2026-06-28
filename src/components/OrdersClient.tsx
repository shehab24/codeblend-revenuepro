"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon, FunnelIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const STATUS_TABS = [
  { key: "all", label: "All Orders", color: "bg-slate-100 text-slate-700" },
  { key: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { key: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  { key: "on-hold", label: "On Hold", color: "bg-amber-100 text-amber-700" },
  { key: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { key: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { key: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-700" },
  { key: "ready-to-ship", label: "Ready to Ship", color: "bg-cyan-100 text-cyan-700" },
];



export function OrdersClient({ licenseId, domain }: { licenseId: string; domain: string }) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeCampaign, setActiveCampaign] = useState("all");
  const [limit, setLimit] = useState("100");
  const [page, setPage] = useState(1);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [reportError, setReportError] = useState("");

  // ROI Calculator State
  const [adSpend, setAdSpend] = useState<number>(0);
  const [dollarRate, setDollarRate] = useState<number>(110);
  const [productCost, setProductCost] = useState<number>(0);

  // Auto-fetch on mount
  useEffect(() => {
    fetchOrders("all", "all", 1, "100");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async (status: string, campaign: string, currentPage: number = page, currentLimit: string = limit) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ 
        license_id: licenseId, 
        limit: currentLimit,
        page: currentPage.toString()
      });
      if (status !== "all") params.set("status", status);
      if (campaign !== "all") params.set("campaign", campaign);
      
      const res = await fetch(`/api/v1/license/site-data?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data?.recent_transactions || []);
        setStats(json.data?.stats || null);
        if (json.data?.campaigns) setCampaigns(json.data.campaigns);
        setFetched(true);
      } else {
        setError(json.error || "Failed to fetch orders");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
    fetchOrders(status, activeCampaign, 1, limit);
  };

  const handleCampaignChange = (campaign: string) => {
    setActiveCampaign(campaign);
    setPage(1);
    fetchOrders(activeStatus, campaign, 1, limit);
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit);
    setPage(1);
    fetchOrders(activeStatus, activeCampaign, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchOrders(activeStatus, activeCampaign, newPage, limit);
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
      case 'on-hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ready-to-ship': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getMethodColor = (method: string) => {
    if (method === 'bKash') return 'bg-pink-50 text-pink-700 border-pink-200';
    if (method === 'COD') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const countForCurrentStatus = stats?.status_counts?.[activeStatus] || stats?.total_orders || 0;
  const totalPages = Math.ceil(countForCurrentStatus / Number(limit)) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href={`/dashboard/user/revenuepro/${licenseId}`}
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm print:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Store Orders</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{domain}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handleDownloadReport}
            disabled={downloading || !fetched || orders.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <DocumentArrowDownIcon className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
            {downloading ? "Generating..." : "Download Report"}
          </button>
          <button
            onClick={() => fetchOrders(activeStatus, activeCampaign, page, limit)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Fetching..." : fetched ? "Refresh" : "Fetch Orders"}
          </button>
        </div>
      </div>

      <div id="report-content" className="space-y-6">
        
        {/* Professional Error Popup for PDF */}
        {reportError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-800">PDF Generation Failed</h4>
              <p className="text-xs text-red-600 mt-1">{reportError}</p>
            </div>
            <button onClick={() => setReportError("")} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        {/* Status Dropdown */}
        <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-2xl w-fit shadow-sm">
          <FunnelIcon className="w-5 h-5 text-slate-400" />
          <select
            value={activeStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-4 uppercase tracking-wider"
          >
            {STATUS_TABS.map(tab => {
              const count = stats?.status_counts?.[tab.key];
              return (
                <option key={tab.key} value={tab.key}>
                  {tab.label} {count !== undefined ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Campaign Dropdown */}
        <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-2xl w-fit shadow-sm">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <select
            value={activeCampaign}
            onChange={(e) => handleCampaignChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-4 uppercase tracking-wider w-48"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((camp, i) => (
              <option key={i} value={camp}>{camp}</option>
            ))}
          </select>
        </div>

        {/* Limit Dropdown */}
        <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-2xl w-fit shadow-sm">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-4 uppercase tracking-wider"
          >
            <option value="10">10 Orders Per Page</option>
            <option value="25">25 Orders Per Page</option>
            <option value="50">50 Orders Per Page</option>
            <option value="100">100 Orders Per Page</option>
          </select>
        </div>
      </div>

      {/* Summary Stats & ROI Calculator */}
      {stats && fetched && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-emerald-700">৳{(Number(stats.total_revenue) || 0).toLocaleString()}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Revenue</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-blue-700">{stats.total_orders || 0}</div>
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Orders</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-amber-700">{stats.pending_orders || 0}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Pending</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-red-700">{stats.cancelled_orders || 0}</div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Cancelled</div>
            </div>
          </div>

          {/* ROI Calculator Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Profit & Loss Calculator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inputs */}
              <div className="space-y-4 md:col-span-1 border-r border-slate-100 pr-6 print:hidden">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Ad Spend ($)</label>
                  <input 
                    type="number" 
                    value={adSpend}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Dollar Rate (৳)</label>
                  <input 
                    type="number" 
                    value={dollarRate}
                    onChange={(e) => setDollarRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Avg Product Cost (৳)</label>
                  <input 
                    type="number" 
                    value={productCost}
                    onChange={(e) => setProductCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all"
                  />
                </div>
              </div>

              {/* Math Results */}
              <div className="md:col-span-2 flex flex-col justify-center print:col-span-3 print:pl-0">
                {(() => {
                  const filteredRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
                  const filteredOrdersCount = orders.length;
                  const totalAdCost = adSpend * dollarRate;
                  const totalProductCost = productCost * filteredOrdersCount;
                  const netProfit = filteredRevenue - totalAdCost - totalProductCost;
                  const isProfitable = netProfit >= 0;

                  return (
                    <>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-500">Gross Revenue (Filtered: {filteredOrdersCount} orders)</span>
                        <span className="text-sm font-bold text-slate-800">৳{filteredRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-500">Total Ad Cost ({adSpend}$ × {dollarRate}৳)</span>
                        <span className="text-sm font-bold text-red-600">- ৳{totalAdCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-500">Total Product Cost ({productCost}৳ × {filteredOrdersCount} orders)</span>
                        <span className="text-sm font-bold text-red-600">- ৳{totalProductCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 mt-2">
                        <span className="text-base font-black text-slate-800">Net Profit</span>
                        <span className={`text-xl font-black ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isProfitable ? '+' : ''}৳{netProfit.toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not fetched yet */}
      {!fetched && !loading && !error && (
        <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-2">Ready to Fetch Orders</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            Click "Fetch Orders" to pull live order data from <span className="font-semibold text-slate-700">{domain}</span>. 
            Use the filter tabs above to narrow by status or payment method.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Fetching orders from {domain}...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {/* Orders Table */}
      {fetched && !loading && orders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden print:overflow-visible shadow-sm">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">{orders.length} Orders Found</span>
            <span className="text-xs text-slate-400">
              Filter: {activeStatus === 'all' ? 'All Statuses' : activeStatus}
            </span>
          </div>
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  <th className="px-4 py-3 font-semibold text-center">Payment</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((trx: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors break-inside-avoid print:break-inside-avoid">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">#{trx.order_number || trx.order_id}</div>
                      {trx.trx_id && <div className="text-xs text-slate-400 font-mono mt-0.5">{trx.trx_id}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-700">{trx.customer || "Guest"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-600 font-mono">{trx.phone || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-slate-800">৳{(Number(trx.amount) || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getMethodColor(trx.payment_method)}`}>
                        {trx.payment_method || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(trx.status)}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-500">
                        {trx.date ? new Date(trx.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {trx.date ? new Date(trx.date).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true }) : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {trx.utm_source ? (
                        <div className="text-xs">
                          <span className="font-semibold text-indigo-600">{trx.utm_source}</span>
                          {trx.utm_medium && <span className="text-slate-400"> / {trx.utm_medium}</span>}
                          {trx.utm_campaign && <div className="text-[10px] text-slate-400 mt-0.5">{trx.utm_campaign}</div>}
                        </div>
                      ) : trx.fbclid ? (
                        <span className="text-xs font-semibold text-blue-600">Facebook Ad</span>
                      ) : (
                        <span className="text-xs text-slate-400">Direct</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <span className="text-xs font-semibold text-slate-500">
                Showing Page <span className="text-slate-800 font-bold">{page}</span> of <span className="text-slate-800 font-bold">{totalPages}</span> ({countForCurrentStatus} total orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-600 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = page;
                  if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-600 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {fetched && !loading && orders.length === 0 && (
        <div className="p-12 bg-white border border-slate-200 border-dashed rounded-2xl text-center">
          <div className="text-3xl mb-3">📭</div>
          <p className="text-sm text-slate-500">No orders found with the selected filters.</p>
        </div>
      )}
      </div>
    </div>
  );
}
