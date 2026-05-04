"use client";

import { useState } from "react";
import { AdminDeleteLicenseButton } from "./AdminDeleteLicenseButton";
import { AdminPingLicenseButton } from "./AdminPingLicenseButton";
import { AdminToggleLicenseStatusButton } from "./AdminToggleLicenseStatusButton";
import { AdminTogglePaymentButton } from "./AdminTogglePaymentButton";
import Link from "next/link";

type LicenseData = {
  id: string;
  domain: string;
  key: string;
  tier: string;
  status: string;
  paymentStatus: string;
  customerEmail: string;
  userName: string | null;
  expirationDate: string | null;
  createdAt: string;
  lastPing: { status: string; timestamp: string } | null;
  pendingTransaction?: {
    id: string;
    transactionId: string | null;
    senderNumber: string | null;
  } | null;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "Active", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "pending":
      return { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
    case "suspended":
      return { label: "Suspended", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
    case "revoked":
      return { label: "Revoked", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
    default:
      return { label: status, bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
  }
}

function LicenseRow({ license }: { license: LicenseData }) {
  const [expanded, setExpanded] = useState(false);
  const badge = getStatusBadge(license.status);
  const isOnline = license.lastPing?.status === "success" && (Date.now() - new Date(license.lastPing.timestamp).getTime()) < 86400000;
  const isExpired = license.expirationDate && new Date(license.expirationDate) < new Date();

  return (
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'shadow-md border-slate-300' : 'border-slate-200 hover:border-slate-300'} ${license.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}>
      {/* Row Header */}
      <div
        className="p-4 cursor-pointer select-none flex items-center gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Domain */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-slate-800 truncate">{license.domain}</span>
            <span className={`text-[0.6rem] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${badge.bg} ${badge.text} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${license.status === 'pending' ? 'animate-pulse' : ''}`}></span>
              {badge.label}
            </span>
            {isExpired && license.status === "active" && (
              <span className="text-[0.6rem] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-red-100 text-red-600">Expired</span>
            )}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {license.customerEmail}
            <span className="mx-1.5 text-slate-200">•</span>
            <span className="text-slate-400 font-mono">{license.tier}</span>
          </div>
        </div>

        {/* Ping Status */}
        {license.status !== "pending" && (
          <div className="hidden md:block shrink-0">
            <span className={`text-[0.6rem] font-bold px-2.5 py-1 rounded-full ${isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
              {isOnline ? "● Online" : "○ Offline"}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="hidden sm:block text-xs text-slate-400 shrink-0 w-20 text-right">
          {new Date(license.createdAt).toLocaleDateString()}
        </div>

        {/* Expand Arrow */}
        <svg
          className={`w-4 h-4 text-slate-300 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Domain</div>
              <div className="text-sm font-semibold text-slate-700 break-all">{license.domain}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</div>
              <div className="text-sm font-semibold text-slate-700 truncate">{license.customerEmail}</div>
              {license.userName && <div className="text-xs text-slate-400">{license.userName}</div>}
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</div>
              <div className="text-sm font-semibold text-slate-700">{new Date(license.createdAt).toLocaleDateString()}</div>
            </div>
            <div className={`rounded-lg p-3 ${isExpired ? 'bg-red-50' : 'bg-slate-50'}`}>
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Expires</div>
              <div className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString() : "Never (Lifetime)"}
              </div>
            </div>
          </div>

          {/* License Key */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5">License Key</div>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-emerald-600 bg-white px-3 py-1.5 rounded border border-slate-200 flex-1 break-all">{license.key}</code>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(license.key); }}
                className="shrink-0 px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded border border-slate-200 transition text-xs font-bold"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Pending Payment Verification */}
          {license.paymentStatus === "pending_verification" && license.pendingTransaction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-[0.65rem] font-bold text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Payment Verification Needed
                </div>
                <div className="text-sm font-bold text-blue-800">
                  TrxID: <span className="font-mono bg-white px-2 py-0.5 rounded text-blue-600 border border-blue-100">{license.pendingTransaction.transactionId}</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">Sender: {license.pendingTransaction.senderNumber}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Are you sure you want to verify this payment?")) return;
                    const { verifyPayment } = await import('@/app/dashboard/admin/paymentActions');
                    await verifyPayment(license.id, license.pendingTransaction!.id, true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Verify Payment
                </button>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Are you sure you want to REJECT this payment?")) return;
                    const { verifyPayment } = await import('@/app/dashboard/admin/paymentActions');
                    await verifyPayment(license.id, license.pendingTransaction!.id, false);
                  }}
                  className="px-3 py-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-slate-100 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <AdminToggleLicenseStatusButton licenseId={license.id} currentStatus={license.status} />
              <AdminTogglePaymentButton licenseId={license.id} currentStatus={license.paymentStatus} />
              {license.status !== "pending" && <AdminPingLicenseButton licenseId={license.id} />}
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href={`/dashboard/admin/licenses/${license.id}`}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded transition"
              >
                View Details
              </Link>
              <AdminDeleteLicenseButton licenseId={license.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminLicenseList({ licenses }: { licenses: LicenseData[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "suspended" | "revoked">("all");

  const filtered = licenses.filter(l => {
    // Status filter
    if (filter !== "all" && l.status !== filter) return false;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      return (
        l.domain.toLowerCase().includes(q) ||
        l.customerEmail.toLowerCase().includes(q) ||
        l.key.toLowerCase().includes(q) ||
        (l.userName && l.userName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingFirst = [...filtered].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Search + Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by domain, email, or license key..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200 shrink-0">
          {[
            { value: "all" as const, label: "All", count: licenses.length },
            { value: "pending" as const, label: "Pending", count: licenses.filter(l => l.status === "pending").length },
            { value: "active" as const, label: "Active", count: licenses.filter(l => l.status === "active").length },
            { value: "suspended" as const, label: "Other", count: licenses.filter(l => !["pending", "active"].includes(l.status)).length },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value === "suspended" ? "all" : tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-[0.6rem] px-1.5 py-0.5 rounded-full ${
                  filter === tab.value ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-xs text-slate-400 font-medium">
        Showing {pendingFirst.length} of {licenses.length} licenses
        {search && <span> · matching "<span className="text-slate-600">{search}</span>"</span>}
      </div>

      {/* License List */}
      <div className="p-4 space-y-3">
        {pendingFirst.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-semibold">No licenses found</div>
            <div className="text-sm mt-1">Try adjusting your search or filter.</div>
          </div>
        ) : (
          pendingFirst.map(license => (
            <LicenseRow key={license.id} license={license} />
          ))
        )}
      </div>
    </div>
  );
}
