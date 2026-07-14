"use client";

import React, { useState, useMemo } from "react";

interface BkashSmsTx {
  id: string;
  trxId: string;
  sender: string;
  amount: number;
  rawMessage: string;
  senderAddress: string;
  status: string;
  orderId: string | null;
  createdAt: string;
}

interface PaymentGatewayClientProps {
  initialTransactions: BkashSmsTx[];
  stats: {
    totalCount: number;
    unusedCount: number;
    usedCount: number;
    totalAmount: number;
  };
}

export default function PaymentGatewayClient({
  initialTransactions,
  stats,
}: PaymentGatewayClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((tx) => {
      const matchesSearch =
        tx.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.orderId && tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialTransactions, searchTerm, statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-3xl">🔌</span> Payment Gateway Integration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your bKash SMS Tracker, view synced incoming payments, and track matched orders.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-sm font-semibold shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          bKash SMS Sync Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Synced */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 text-xl font-bold">
            📥
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{stats.totalCount}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Synced SMS
            </div>
          </div>
        </div>

        {/* Unused / Unclaimed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 text-xl font-bold">
            🟢
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{stats.unusedCount}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Unused / Available
            </div>
          </div>
        </div>

        {/* Used / Matched */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 text-xl font-bold">
            🔵
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600">{stats.usedCount}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Matched Orders
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 text-xl font-bold">
            ৳
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-600">
              ৳{stats.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Total Volume
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-full md:max-w-md relative">
            <input
              type="text"
              placeholder="Search by TrxID, sender number, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer min-w-[120px]"
            >
              <option value="all">All SMS</option>
              <option value="unused">Unused</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="py-3 px-6">Date & Time</th>
                <th className="py-3 px-6">Transaction ID</th>
                <th className="py-3 px-6">Sender Phone</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Matched Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        onClick={() => toggleExpand(tx.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 font-medium text-slate-500">
                          {new Date(tx.createdAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-700">
                          <span className="flex items-center gap-1">
                            {tx.trxId}
                            <span className="text-[10px] text-slate-300">▼</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600">
                          {tx.sender}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-slate-800">
                          ৳{tx.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${
                                tx.status === "unused"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-bold text-slate-500">
                          {tx.orderId ? (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200">
                              #{tx.orderId}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Collapsible Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={6} className="py-4 px-6 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Raw SMS Message Details
                              </div>
                              <p className="bg-white border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-600 leading-relaxed shadow-inner">
                                {tx.rawMessage}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>Sender Address: <strong className="text-slate-600">{tx.senderAddress}</strong></span>
                                <span>•</span>
                                <span>Received at: <strong className="text-slate-600">{new Date(tx.createdAt).toLocaleString()}</strong></span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Info Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-bold">Integrating with your WordPress Site</h3>
          <p className="text-sm text-slate-300 mt-1">
            Setup the WooCommerce bKash payment gateway to validate payments against this server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs">1</span>
              Install the Mobile SMS Sync App
            </h4>
            <p className="leading-relaxed">
              Make sure you have downloaded the CodeBlend Mobile Tracker App. Log in using your client credentials and authorize notification listening permission to capture and push incoming transaction SMS to this dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs">2</span>
              Configure bKash WooCommerce Gateway
            </h4>
            <p className="leading-relaxed">
              In your WordPress admin under <strong>WooCommerce {">"} Settings {">"} Payments</strong>, select <strong>RevenuePro bKash Gateway</strong>. Set validation endpoint settings to:
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-xs text-emerald-400 border border-slate-700/50 break-all select-all">
              https://codeblend.co/api/v1/payments/bkash-manual/verify
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
