"use client";

import { useState, useEffect } from "react";
import { getExpenseTransactions } from "../actions";

type BkashTransaction = {
  id: string;
  trxId?: string;
  sender?: string;
  amount: number;
  rawMessage: string;
  senderAddress: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  type: "credit" | "debit";
  merchant?: string;
  category?: string;
};

export default function ExpenseTrackerPage() {
  const [bkashTransactions, setBkashTransactions] = useState<BkashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<BkashTransaction | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSender, setSelectedSender] = useState<string>("all");
  const itemsPerPage = 15;

  // Derived helper to categorize incoming SMS based on message structure
  const getTxType = (raw: string): "credit" | "debit" => {
    const msg = (raw || "").toLowerCase();
    // bKash Cash In / Received Money keywords
    if (
      msg.includes("received") ||
      msg.includes("credited") ||
      msg.includes("cash in") ||
      msg.includes("deposit") ||
      msg.includes("refund") ||
      msg.includes("inflow")
    ) {
      return "credit"; // Inflow (Credit)
    }
    return "debit"; // Outflow (Debit) - e.g. Send Money, Payment, Cash Out
  };

  // Helper to extract or fallback TrxID
  const getTrxId = (tx: any) => {
    if (tx.trxId) return tx.trxId;
    if (tx.originalSms) {
      const match = tx.originalSms.match(/(?:TrxID|TxnID|TxID|TnxID|Transaction\s*ID|Ref\s*ID|Ref|Txn|Trx)\s*:?\s*([A-Z0-9]{6,20})/i);
      if (match) return match[1].toUpperCase();
    }
    // Fallback to a shortened version of the client ID
    return tx.id.replace("tx-native-", "NAT-").replace("tx-live-", "LIVE-").replace("tx-manual-", "MAN-").substring(0, 14);
  };

  // Load personal expense transactions
  const loadTransactions = async () => {
    setIsLoading(true);
    const res = await getExpenseTransactions();
    if (res.success && res.transactions) {
      const mapped = res.transactions.map((tx: any) => ({
        ...tx,
        rawMessage: tx.originalSms || `[Manual Entry] Transaction logged manually.`,
        senderAddress: tx.senderAddress || tx.merchant || "Unknown",
        status: "synced",
      }));
      setBkashTransactions(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Overall calculations based on derived transaction types
  const totalIncome = bkashTransactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = bkashTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Date Calculation Helpers
  const now = new Date();

  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const startOfThisWeek = (() => {
    const d = new Date(now);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= startOfThisWeek;
  };

  const startOfPrevWeek = (() => {
    const d = new Date(startOfThisWeek);
    d.setDate(d.getDate() - 7);
    return d;
  })();

  const isPrevWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= startOfPrevWeek && d < startOfThisWeek;
  };

  // Monthly stats
  const monthlyInflow = bkashTransactions
    .filter((t) => t.type === "credit" && isThisMonth(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyOutflow = bkashTransactions
    .filter((t) => t.type === "debit" && isThisMonth(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  // This Week stats
  const weeklyInflow = bkashTransactions
    .filter((t) => t.type === "credit" && isThisWeek(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyOutflow = bkashTransactions
    .filter((t) => t.type === "debit" && isThisWeek(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  // Previous Week stats
  const prevWeeklyInflow = bkashTransactions
    .filter((t) => t.type === "credit" && isPrevWeek(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  const prevWeeklyOutflow = bkashTransactions
    .filter((t) => t.type === "debit" && isPrevWeek(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  // Extract unique senderAddress names dynamically
  const uniqueSenders = Array.from(
    new Set(bkashTransactions.map((t) => t.senderAddress).filter(Boolean))
  ) as string[];

  // Filtered Ledger list
  const filteredLedger = bkashTransactions.filter((t) => {
    // Filter by type
    const matchesType = (() => {
      if (filter === "all") return true;
      if (filter === "income") return t.type === "credit";
      if (filter === "expense") return t.type === "debit";
      return true;
    })();

    // Filter by sender address
    const matchesSender = (() => {
      if (selectedSender === "all") return true;
      return (t.senderAddress || "Unknown") === selectedSender;
    })();

    return matchesType && matchesSender;
  });

  // Calculate pagination
  const totalItems = filteredLedger.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTransactions = filteredLedger.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          💰 Expense & Cashflow Tracker
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Monitor your automatically synced bKash inflow, outflow, and raw SMS transaction history.
        </p>
      </div>

      {/* KPI Cards (Overall Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Net Balance</span>
            <div className={`text-3xl font-black mt-2 tracking-tight ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ৳ {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${balance >= 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
            {balance >= 0 ? "In Surplus" : "In Deficit"}
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Synced Inflow</span>
            <div className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">
              ৳ {totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-emerald-700">
            📈 {bkashTransactions.filter((t) => t.type === "credit").length} Inflow transactions synced
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Total Synced Outflow</span>
            <div className="text-3xl font-black text-rose-600 mt-2 tracking-tight">
              ৳ {totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-rose-700">
            📉 {bkashTransactions.filter((t) => t.type === "debit").length} Outflow transactions synced
          </div>
        </div>
      </div>

      {/* Calculative History (This Month, This Week, Previous Week) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            📊 Calculative Interval History
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Summarized inflow, outflow, and net balance dynamics across key calendar intervals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* This Month Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-slate-700">This Month</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {now.toLocaleString("en-US", { month: "long" })}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inflow
                  </span>
                  <span className="font-extrabold text-emerald-600 font-mono">
                    + ৳{monthlyInflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Outflow
                  </span>
                  <span className="font-extrabold text-rose-600 font-mono">
                    - ৳{monthlyOutflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold">Net Margin</span>
                  <span className={`font-black font-mono ${monthlyInflow - monthlyOutflow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ৳{(monthlyInflow - monthlyOutflow).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* This Week Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-slate-700">This Week</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Current
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inflow
                  </span>
                  <span className="font-extrabold text-emerald-600 font-mono">
                    + ৳{weeklyInflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Outflow
                  </span>
                  <span className="font-extrabold text-rose-600 font-mono">
                    - ৳{weeklyOutflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold">Net Margin</span>
                  <span className={`font-black font-mono ${weeklyInflow - weeklyOutflow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ৳{(weeklyInflow - weeklyOutflow).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Week Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-slate-700">Previous Week</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Last 7D
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inflow
                  </span>
                  <span className="font-extrabold text-emerald-600 font-mono">
                    + ৳{prevWeeklyInflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Outflow
                  </span>
                  <span className="font-extrabold text-rose-600 font-mono">
                    - ৳{prevWeeklyOutflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-bold">Net Margin</span>
                  <span className={`font-black font-mono ${prevWeeklyInflow - prevWeeklyOutflow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ৳{(prevWeeklyInflow - prevWeeklyOutflow).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Transactions Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              📱 Synced Transactions Ledger
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Automated bKash inflow and outflow history synced in real-time from your Android SMS Listener mobile app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0">
              {[
                { value: "all" as const, label: "All" },
                { value: "income" as const, label: "Inflow" },
                { value: "expense" as const, label: "Outflow" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setFilter(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border-none cursor-pointer ${
                    filter === tab.value
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sender Dropdown Filter */}
            {uniqueSenders.length > 1 && (
              <select
                value={selectedSender}
                onChange={(e) => {
                  setSelectedSender(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50 transition"
              >
                <option value="all">All Senders</option>
                {uniqueSenders.map((sender) => (
                  <option key={sender} value={sender}>
                    {sender}
                  </option>
                ))}
              </select>
            )}

            {/* Refresh Button */}
            <button
              onClick={loadTransactions}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5 font-bold">Received Date</th>
                <th className="p-3.5 font-bold">Transaction ID</th>
                <th className="p-3.5 font-bold">Sender / Context</th>
                <th className="p-3.5 font-bold">Type</th>
                <th className="p-3.5 font-bold">Amount</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    <svg className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Loading synced transactions...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition text-slate-700">
                    <td className="p-3.5 font-semibold text-slate-500 min-w-[140px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-extrabold font-mono text-slate-800 tracking-wider">
                      {getTrxId(tx)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{tx.senderAddress || "SMS Sync"}</div>
                      {tx.sender && tx.sender !== tx.senderAddress && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.sender}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[0.6rem] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                          tx.type === "credit"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {tx.type === "credit" ? "Inflow" : "Outflow"}
                      </span>
                    </td>
                    <td className={`p-3.5 font-black font-mono text-sm ${tx.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.type === "credit" ? "+" : "-"} ৳{tx.amount.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[0.6rem] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                          tx.status === "used"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getTrxId(tx));
                            alert("Transaction ID copied!");
                          }}
                          className="p-1 hover:bg-slate-250 rounded text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
                          title="Copy TrxID"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1 hover:bg-slate-250 rounded text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
                          title="View Details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="text-2xl mb-1.5">🔍</div>
                    <div className="text-xs font-bold">No synced transactions found</div>
                    <p className="text-[11px] text-slate-400 mt-1">Transactions synchronized from your mobile app will display here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
            <div className="text-xs text-slate-500 font-semibold">
              Showing <span className="text-slate-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-slate-800 font-bold">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="text-slate-800 font-bold">{totalItems}</span> transactions
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1"
              >
                Previous
              </button>
              <div className="text-xs font-bold text-slate-600 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                ✉️ Synced Transaction Source Details
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Received Date</span>
                  <span className="block mt-1 font-bold text-slate-700">
                    {new Date(selectedTx.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Type</span>
                  <span className="block mt-1">
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                        selectedTx.type === "credit"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {selectedTx.type === "credit" ? "Inflow" : "Outflow"}
                    </span>
                  </span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Transaction ID</span>
                  <span className="block mt-1 font-mono font-black text-slate-800 select-all">
                    {getTrxId(selectedTx)}
                  </span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sender / Context</span>
                  <span className="block mt-1 font-mono font-bold text-slate-700 select-all">
                    {selectedTx.senderAddress || "SMS Sync"}
                    {selectedTx.sender && selectedTx.sender !== selectedTx.senderAddress ? ` (${selectedTx.sender})` : ""}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Amount</span>
                <span className={`block mt-1 font-mono font-black text-lg ${selectedTx.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                  ৳{selectedTx.amount.toFixed(2)}
                </span>
              </div>

              {/* Raw message block */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Raw SMS Message</span>
                <div className="relative bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed break-words pr-12 select-all">
                  {selectedTx.rawMessage}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTx.rawMessage);
                      alert("Raw message copied!");
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition border-none cursor-pointer"
                    title="Copy full message"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
