"use client";

import { useState, useEffect } from "react";
import { getBkashSmsTransactions } from "../actions";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Other Income"],
  expense: ["Food", "Rent", "Utilities", "Marketing", "Hosting/Cloud", "Plugins", "Office", "Salary Payouts", "Other Expense"]
};

export default function ExpenseTrackerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bkashTransactions, setBkashTransactions] = useState<any[]>([]);
  const [isLoadingBkash, setIsLoadingBkash] = useState(true);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [smsFilter, setSmsFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Reset page when SMS filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [smsFilter]);

  // Load bKash SMS transactions
  useEffect(() => {
    async function loadBkashTransactions() {
      setIsLoadingBkash(true);
      const res = await getBkashSmsTransactions();
      if (res.success && res.transactions) {
        setBkashTransactions(res.transactions);
      }
      setIsLoadingBkash(false);
    }
    loadBkashTransactions();
  }, []);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("revenuepro_expenses");
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to local storage
  const saveTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    localStorage.setItem("revenuepro_expenses", JSON.stringify(newTx));
  };

  // Handle category reset when type changes
  useEffect(() => {
    setCategory(CATEGORIES[type][0]);
  }, [type]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };

    saveTransactions([newTx, ...transactions]);
    setTitle("");
    setAmount("");
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      saveTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  // Filter synced SMS transactions based on selected keyword
  const filteredBkashTransactions = bkashTransactions.filter((tx) => {
    if (smsFilter === "all") return true;

    const senderLower = (tx.sender || "").toLowerCase();
    const rawLower = (tx.rawMessage || "").toLowerCase();

    if (smsFilter === "bkash") {
      return senderLower.includes("bkash") || rawLower.includes("bkash");
    }
    if (smsFilter === "nagad") {
      return senderLower.includes("nagad") || rawLower.includes("nagad");
    }
    if (smsFilter === "rocket") {
      return senderLower.includes("rocket") || rawLower.includes("rocket");
    }
    if (smsFilter === "bank_asia") {
      return (
        senderLower.includes("bank asia") ||
        rawLower.includes("bank asia") ||
        senderLower.includes("bankasia") ||
        rawLower.includes("bankasia")
      );
    }
    if (smsFilter === "other_bank") {
      const isBankAsia =
        senderLower.includes("bank asia") ||
        rawLower.includes("bank asia") ||
        senderLower.includes("bankasia") ||
        rawLower.includes("bankasia");
      if (isBankAsia) return false;

      // Detect general bank keywords
      const bankKeywords = [
        "bank",
        "visa",
        "mastercard",
        "card",
        "ibanking",
        "deposit",
        "credited",
        "debited",
        "account",
        "scb",
        "ebl",
        "brac",
        "citybank",
        "nexus",
        "agent",
      ];
      return bankKeywords.some((kw) => senderLower.includes(kw) || rawLower.includes(kw));
    }
    return false;
  });

  // Calculate pagination
  const totalItems = filteredBkashTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTransactions = filteredBkashTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          💰 Expense Tracker
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Monitor your income, plugin costs, marketing expenses, and overall business cashflow.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
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
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Revenue</span>
            <div className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">
              ৳ {totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-emerald-700">
            📈 {transactions.filter((t) => t.type === "income").length} Income entries logged
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Total Expenses</span>
            <div className="text-3xl font-black text-rose-600 mt-2 tracking-tight">
              ৳ {totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-rose-700">
            📉 {transactions.filter((t) => t.type === "expense").length} Expense entries logged
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            📝 Log Transaction
          </h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            {/* Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === "expense"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === "income"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hosting billing, Client payout..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Amount (৳)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer border-none ${
                type === "income"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
              }`}
            >
              Add {type === "income" ? "Income" : "Expense"}
            </button>
          </form>
        </div>

        {/* Transaction History List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <h3 className="text-base font-bold text-slate-800">
              📋 Transactions History
            </h3>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0 self-start sm:self-auto">
              {[
                { value: "all" as const, label: "All" },
                { value: "income" as const, label: "Income" },
                { value: "expense" as const, label: "Expenses" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all border-none cursor-pointer ${
                    filter === tab.value
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 mt-4 overflow-y-auto max-h-[400px] pr-1 space-y-2.5 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3.5 rounded-xl border border-solid transition flex items-center justify-between gap-4 ${
                    tx.type === "income"
                      ? "bg-emerald-50/10 border-emerald-100 hover:border-emerald-200"
                      : "bg-rose-50/10 border-rose-100 hover:border-rose-200"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">{tx.title}</span>
                      <span
                        className={`text-[0.6rem] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {tx.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {new Date(tx.date).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-extrabold font-mono ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.type === "income" ? "+" : "-"} ৳{tx.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border-none cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <div className="text-3xl mb-2">🔍</div>
                <div className="text-xs font-bold">No transactions found</div>
                <p className="text-[11px] text-slate-400 mt-1">Logged items will display here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synced SMS Transactions Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              📱 Synced SMS Transactions
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Payments and deposits forwarded in real-time from your Android SMS Listener mobile app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* SMS Filter Selector */}
            <select
              value={smsFilter}
              onChange={(e) => setSmsFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 outline-none cursor-pointer transition"
            >
              <option value="all">All Senders</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank_asia">Bank Asia</option>
              <option value="other_bank">Other Bank / Cards</option>
            </select>

            <button
              onClick={async () => {
                setIsLoadingBkash(true);
                const res = await getBkashSmsTransactions();
                if (res.success && res.transactions) {
                  setBkashTransactions(res.transactions);
                }
                setIsLoadingBkash(false);
              }}
              disabled={isLoadingBkash}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${isLoadingBkash ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5 font-bold">Received Date</th>
                <th className="p-3.5 font-bold">Transaction ID</th>
                <th className="p-3.5 font-bold">Sender Phone</th>
                <th className="p-3.5 font-bold">Amount</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Raw SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {isLoadingBkash ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                    <svg className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Loading synced payments...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition text-slate-700">
                    <td className="p-3.5 font-semibold text-slate-500 min-w-[140px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-extrabold font-mono text-slate-800 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.trxId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tx.trxId);
                            alert("Transaction ID copied!");
                          }}
                          className="p-1 hover:bg-slate-250 rounded text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
                          title="Copy TrxID"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold font-mono">
                      {tx.sender}
                    </td>
                    <td className="p-3.5 font-black text-slate-800 font-mono">
                      ৳{tx.amount.toFixed(2)}
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
                    <td className="p-3.5 max-w-[220px] truncate text-[10px] text-slate-400 font-medium" title={tx.rawMessage}>
                      {tx.rawMessage}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="text-2xl mb-1.5">🔍</div>
                    <div className="text-xs font-bold">No synced SMS transactions found matching filter</div>
                    <p className="text-[11px] text-slate-400 mt-1">Try selecting a different sender or sync new payments.</p>
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
    </div>
  );
}
