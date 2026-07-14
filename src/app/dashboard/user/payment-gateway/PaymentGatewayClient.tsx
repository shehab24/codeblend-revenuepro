"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { saveGatewaySettings, saveBrandingSettings, generateGatewayKeys, simulateSandboxSms, createSandboxPayment } from "./actions";

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
  gatewaySettings: {
    apiKey: string | null;
    apiSecret: string | null;
    bkash: string;
    nagad: string;
    rocket: string;
    active: boolean;
    brandName: string;
    brandLogo: string;
    brandColor: string;
  };
}

type TabType = "transactions" | "settings" | "api";

export default function PaymentGatewayClient({
  initialTransactions,
  stats,
  gatewaySettings,
}: PaymentGatewayClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive active tab from URL (?tab=transactions|settings|api)
  const activeTab: TabType = useMemo(() => {
    const t = searchParams.get("tab");
    if (t === "settings") return t;
    if (t === "api" && gatewaySettings.active) return t;
    return "transactions";
  }, [searchParams, gatewaySettings.active]);

  const setActiveTab = useCallback((tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [showSandboxSuccess, setShowSandboxSuccess] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sandbox_status") === "success") {
        setShowSandboxSuccess(true);
        // Remove sandbox_status but keep tab param
        const next = new URLSearchParams(params.toString());
        next.delete("sandbox_status");
        const qs = next.toString();
        window.history.replaceState({}, document.title, qs ? `${pathname}?${qs}` : pathname);
      }
    }
  }, [pathname]);

  // Settings states
  const [bkash, setBkash] = useState(gatewaySettings.bkash);
  const [nagad, setNagad] = useState(gatewaySettings.nagad);
  const [rocket, setRocket] = useState(gatewaySettings.rocket);
  const [bkashActive, setBkashActive] = useState(!!gatewaySettings.bkash);
  const [nagadActive, setNagadActive] = useState(!!gatewaySettings.nagad);
  const [rocketActive, setRocketActive] = useState(!!gatewaySettings.rocket);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Branding states
  const [brandName, setBrandName] = useState(gatewaySettings.brandName);
  const [brandLogo, setBrandLogo] = useState(gatewaySettings.brandLogo);
  const [brandColor, setBrandColor] = useState(gatewaySettings.brandColor);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [brandSaveMsg, setBrandSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBrandLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Gateway Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [formProvider, setFormProvider] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [formNumber, setFormNumber] = useState("");
  const [editingProvider, setEditingProvider] = useState<"bkash" | "nagad" | "rocket" | null>(null);

  // API credentials states
  const [apiKey, setApiKey] = useState(gatewaySettings.apiKey);
  const [apiSecret, setApiSecret] = useState(gatewaySettings.apiSecret);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"php" | "node" | "curl">("php");

  // Sandbox simulation states
  const [sandboxMethod, setSandboxMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [sandboxAmount, setSandboxAmount] = useState("1200");
  const [sandboxSender, setSandboxSender] = useState("01712345678");
  const [sandboxTrxId, setSandboxTrxId] = useState(() => `TXN${Math.floor(100000 + Math.random() * 900000)}CP`);
  const [isSimulating, setIsSimulating] = useState(false);
  const [sandboxMessage, setSandboxMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [generatedSandboxUrl, setGeneratedSandboxUrl] = useState<string | null>(null);

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

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  const saveSettingsDirectly = async (
    nextBkash: string,
    nextNagad: string,
    nextRocket: string
  ) => {
    setIsSavingSettings(true);
    setSaveMessage(null);
    try {
      const formData = new FormData();
      formData.append("bkash", nextBkash);
      formData.append("nagad", nextNagad);
      formData.append("rocket", nextRocket);
      const res = await saveGatewaySettings(formData);
      if (res.success) {
        setSaveMessage({ type: "success", text: "Merchant payment configurations updated successfully!" });
        setShowAddForm(false);
        setEditingProvider(null);
        setFormNumber("");
      } else {
        setSaveMessage({ type: "error", text: "Failed to save configurations." });
      }
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let nextBkash = bkash;
    let nextNagad = nagad;
    let nextRocket = rocket;

    const providerToSet = editingProvider || formProvider;

    if (providerToSet === "bkash") {
      nextBkash = formNumber;
      setBkash(formNumber);
      setBkashActive(true);
    } else if (providerToSet === "nagad") {
      nextNagad = formNumber;
      setNagad(formNumber);
      setNagadActive(true);
    } else if (providerToSet === "rocket") {
      nextRocket = formNumber;
      setRocket(formNumber);
      setRocketActive(true);
    }

    saveSettingsDirectly(nextBkash, nextNagad, nextRocket);
  };

  const handleDeleteGateway = (provider: "bkash" | "nagad" | "rocket") => {
    if (!confirm(`Are you sure you want to delete the ${provider} gateway?`)) {
      return;
    }

    let nextBkash = bkash;
    let nextNagad = nagad;
    let nextRocket = rocket;

    if (provider === "bkash") {
      nextBkash = "";
      setBkash("");
      setBkashActive(false);
    } else if (provider === "nagad") {
      nextNagad = "";
      setNagad("");
      setNagadActive(false);
    } else if (provider === "rocket") {
      nextRocket = "";
      setRocket("");
      setRocketActive(false);
    }

    saveSettingsDirectly(nextBkash, nextNagad, nextRocket);
  };

  const handleGenerateKeys = async () => {
    if (!confirm("Are you sure you want to generate new API Keys? This will invalidate your old keys and break existing integrations!")) {
      return;
    }
    setIsGeneratingKeys(true);
    try {
      const res = await generateGatewayKeys();
      if (res.success && res.apiKey && res.apiSecret) {
        setApiKey(res.apiKey);
        setApiSecret(res.apiSecret);
      }
    } catch (err: any) {
      alert("Failed to generate keys: " + err.message);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const handleSimulateSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSandboxMessage(null);
    try {
      const formData = new FormData();
      formData.append("method", sandboxMethod);
      formData.append("amount", sandboxAmount);
      formData.append("sender", sandboxSender);
      formData.append("trxId", sandboxTrxId);

      const res = await simulateSandboxSms(formData);
      if (res.success) {
        setSandboxMessage({
          type: "success",
          text: `Simulated SMS successfully! TrxID: ${res.trxId} is now live in your unused logs.`,
        });
        // Generate a new random TrxID for the next test
        setSandboxTrxId(`TXN${Math.floor(100000 + Math.random() * 900000)}CP`);
      }
    } catch (err: any) {
      setSandboxMessage({ type: "error", text: err.message || "SMS simulation failed." });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateSandboxPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSandboxMessage(null);
    setGeneratedSandboxUrl(null);
    try {
      const formData = new FormData();
      formData.append("amount", sandboxAmount);

      const res = await createSandboxPayment(formData, window.location.origin);
      if (res.success && res.paymentUrl) {
        setGeneratedSandboxUrl(res.paymentUrl);
        setSandboxMessage({
          type: "success",
          text: `Sandbox checkout generated successfully! Click 'Launch Sandbox Checkout' and use TrxID 'SANDBOX123' to verify.`,
        });
      }
    } catch (err: any) {
      setSandboxMessage({ type: "error", text: err.message || "Sandbox checkout generation failed." });
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {showSandboxSuccess && (
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-md flex items-center justify-between gap-4 animate-in fade-in duration-350">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base">
              Sandbox Payment Verified Successfully!
            </h3>
            <p className="text-xs text-emerald-100">
              The CodePay payment matched your simulated SMS transaction, updated status to completed, and redirected back to your callback URL successfully.
            </p>
          </div>
          <button 
            onClick={() => setShowSandboxSuccess(false)}
            className="text-white hover:text-emerald-250 text-xs font-black uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            CodePay Gateway
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Setup merchant configurations, obtain API keys, and track live transactions like UddoktaPay.
          </p>
        </div>
        {gatewaySettings.active && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-sm font-semibold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Gateway Active
          </div>
        )}
      </div>

      {/* Tabs Switcher — URL-driven */}
      <div className="flex border-b border-slate-200">
        {(["transactions", "settings", "api"] as const)
          .filter((tab) => tab !== "api" || gatewaySettings.active)
          .map((tab) => {
            const labels: Record<TabType, string> = {
              transactions: "Transactions & Logs",
              settings: "Gateway Settings",
              api: "Developer Keys & API",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
      </div>

      {activeTab === "transactions" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.totalCount}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Total Synced SMS
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">{stats.unusedCount}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Unused / Available
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600">{stats.usedCount}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Matched Orders
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No matching transactions found.
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => {
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
                              <td colSpan={6} className="py-4 px-6 border-l-2 border-slate-800">
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

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Left: entries info + rows-per-page */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">{filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>
                  {" "}–{" "}
                  <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-slate-700">{filteredTransactions.length}</span> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    {[10, 20, 30, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} rows</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right: page navigation with smart ellipsis */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    Prev
                  </button>
                  {(() => {
                    const pages: (number | "...")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("...");
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return pages.map((p, idx) =>
                      p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs text-slate-400 select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            currentPage === p
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (() => {
        // Gateway meta config
        const GATEWAY_META: Record<string, { label: string; currency: string; desc: string; placeholder: string; bg: string; border: string; textColor: string; logoUrl: string; }> = {
          bkash:  { label: "bKash Personal",  currency: "BDT", desc: "Send Money SMS trigger matching",  placeholder: "017XXXXXXXX", bg: "bg-pink-50",   border: "border-pink-200",   textColor: "text-pink-700",   logoUrl: "/logos/bkash.png" },
          nagad:  { label: "Nagad Personal",   currency: "BDT", desc: "Personal Nagad wallet matching",   placeholder: "019XXXXXXXX", bg: "bg-orange-50", border: "border-orange-200", textColor: "text-orange-700", logoUrl: "/logos/nagad.png" },
          rocket: { label: "Rocket Personal",  currency: "BDT", desc: "DBBL Rocket TrxID matching",       placeholder: "018XXXXXXXXX", bg: "bg-purple-50", border: "border-purple-200", textColor: "text-purple-700", logoUrl: "/logos/rocket.png" },
        };

        const configuredGateways = [
          ...(bkashActive  ? [{ provider: "bkash"  as const, number: bkash  }] : []),
          ...(nagadActive  ? [{ provider: "nagad"  as const, number: nagad  }] : []),
          ...(rocketActive ? [{ provider: "rocket" as const, number: rocket }] : []),
        ];

        const availableToAdd = (["bkash", "nagad", "rocket"] as const).filter(
          (p) => !(p === "bkash" ? bkashActive : p === "nagad" ? nagadActive : rocketActive)
        );

        return (
        <div className="w-full space-y-6">

          {/* ── Add Gateway Modal ── */}
          {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">
                      {editingProvider ? "Edit Gateway" : "Add Payment Gateway"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Configure a receiving wallet number for your checkout page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setEditingProvider(null); setFormNumber(""); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold transition cursor-pointer"
                  >✕</button>
                </div>

                {!editingProvider && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Select Gateway</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableToAdd.map((p) => {
                        const m = GATEWAY_META[p];
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormProvider(p)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition cursor-pointer ${
                              formProvider === p ? `${m.border} ${m.bg}` : "border-slate-200 bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              <img src={m.logoUrl} alt={m.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wide ${formProvider === p ? m.textColor : "text-slate-500"}`}>{p}</span>
                          </button>
                        );
                      })}
                      {availableToAdd.length === 0 && (
                        <p className="col-span-3 text-xs text-slate-400 text-center py-3">All gateways are already configured.</p>
                      )}
                    </div>
                  </div>
                )}

                {editingProvider && (
                  <div className={`flex items-center gap-3 p-3 rounded-2xl ${GATEWAY_META[editingProvider].bg} ${GATEWAY_META[editingProvider].border} border`}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      <img src={GATEWAY_META[editingProvider].logoUrl} alt={GATEWAY_META[editingProvider].label} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase ${GATEWAY_META[editingProvider].textColor}`}>{GATEWAY_META[editingProvider].label}</p>
                      <p className="text-[10px] text-slate-500">{GATEWAY_META[editingProvider].desc}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleGatewaySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Wallet Number</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">BD</span>
                      <input
                        type="text"
                        required
                        value={formNumber}
                        onChange={(e) => setFormNumber(e.target.value)}
                        placeholder={GATEWAY_META[editingProvider || formProvider]?.placeholder || "01XXXXXXXXX"}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-mono font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowAddForm(false); setEditingProvider(null); setFormNumber(""); }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >Cancel</button>
                    <button
                      type="submit"
                      disabled={isSavingSettings || (availableToAdd.length === 0 && !editingProvider)}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingSettings ? "Saving…" : editingProvider ? "Save Changes" : "Add Gateway"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Gateway Table Card ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Merchant Configuration</p>
                <h2 className="text-lg font-extrabold text-slate-800">Payment Gateways</h2>
              </div>
              <div className="flex items-center gap-2">
                {saveMessage && (
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    saveMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-600 border-red-100"
                  }`}>{saveMessage.text}</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (availableToAdd.length === 0) return;
                    setFormProvider(availableToAdd[0]);
                    setFormNumber("");
                    setEditingProvider(null);
                    setShowAddForm(true);
                  }}
                  disabled={availableToAdd.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-sm"
                >
                  <span className="text-base leading-none">+</span> Add Gateway
                </button>
              </div>
            </div>

            {/* Table */}
            {configuredGateways.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-700">No Payment Gateways Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Click <strong>Add Gateway</strong> to configure your first bKash, Nagad, or Rocket receiving number.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3">Gateway</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Wallet Number</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Currency</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Status</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {configuredGateways.map(({ provider, number }) => {
                    const m = GATEWAY_META[provider];
                    return (
                      <tr key={provider} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              <img src={m.logoUrl} alt={m.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{m.label}</p>
                              <p className="text-[11px] text-slate-400">{m.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{number || "—"}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{m.currency}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProvider(provider);
                                setFormNumber(number || "");
                                setShowAddForm(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition cursor-pointer shadow-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGateway(provider)}
                              disabled={isSavingSettings}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 transition cursor-pointer disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Merchant Branding ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Checkout Page</p>
              <h2 className="text-lg font-extrabold text-slate-800">Merchant Branding</h2>
              <p className="text-xs text-slate-500 mt-0.5">Customise how your business appears on the customer payment screen.</p>
            </div>
            <div className="p-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingBranding(true);
                  setBrandSaveMsg(null);
                  try {
                    const fd = new FormData();
                    fd.append("brandName", brandName);
                    fd.append("brandColor", brandColor);
                    
                    if (brandLogo && !brandLogo.startsWith("data:")) {
                      fd.append("brandLogo", brandLogo);
                    }
                    if (logoFile) {
                      fd.append("logoFile", logoFile);
                    }
                    
                    const res = await saveBrandingSettings(fd);
                    if (res.success) {
                      if (res.brandLogo) {
                        setBrandLogo(res.brandLogo);
                      }
                      setLogoFile(null);
                      setBrandSaveMsg({ type: "success", text: "Branding saved successfully!" });
                    }
                  } catch (err: any) {
                    setBrandSaveMsg({ type: "error", text: err.message || "Failed to save branding." });
                  } finally {
                    setIsSavingBranding(false);
                  }
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Business / Brand Name</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Marcus Store"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Shown as &quot;Pay to [Brand Name]&quot; on the checkout page.</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Logo Image</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setLogoInputMode("upload")}
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md transition cursor-pointer ${
                              logoInputMode === "upload" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoInputMode("url")}
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md transition cursor-pointer ${
                              logoInputMode === "url" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Logo URL
                          </button>
                        </div>
                      </div>

                      {logoInputMode === "upload" ? (
                        <div className="space-y-2">
                          {brandLogo ? (
                            <div className="relative group flex items-center justify-between border border-slate-200 bg-slate-50/50 rounded-2xl p-4 transition">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-20 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-1.5 shadow-2xs">
                                  <img
                                    src={brandLogo}
                                    alt="Logo preview"
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-700">Logo Selected</p>
                                  <p className="text-[10px] text-slate-400">
                                    {logoFile ? `File: ${logoFile.name}` : "Active brand logo"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <label className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer shadow-3xs transition">
                                  Change
                                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLogoFile(null);
                                    setBrandLogo("");
                                  }}
                                  className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-3xs transition cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <p className="text-xs text-slate-500 font-semibold px-4 text-center truncate w-full">
                                    Click to select a logo file
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, SVG, or JPG (max 2MB)</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                              </label>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={brandLogo}
                          onChange={(e) => setBrandLogo(e.target.value)}
                          placeholder="https://your-cdn.com/logo.png"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">Recommended: 200×60px transparent logo.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Header Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          placeholder="#0f172a"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Used as the checkout header background color.</p>
                    </div>
                  </div>

                  {/* Right: live preview */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Live Preview</p>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                      {/* Preview header */}
                      <div
                        className="px-5 py-6 text-center text-white space-y-2 transition-colors duration-300"
                        style={{ backgroundColor: brandColor || "#0f172a" }}
                      >
                        {brandLogo ? (
                          <img src={brandLogo} alt={brandName || "Brand"} className="h-8 object-contain mx-auto mb-2" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-1">
                            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black tracking-widest uppercase border border-emerald-500/30">CodePay Secured</span>
                        <div className="text-2xl font-black">৳1,200.00</div>
                        <div className="text-[10px] text-white/60 uppercase tracking-wider">Pay to {brandName || "Your Brand"}</div>
                      </div>
                      {/* Preview body snippet */}
                      <div className="bg-white px-4 py-3 text-xs text-slate-400 text-center border-t border-slate-100">
                        Customer payment method selection appears here
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {brandSaveMsg ? (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      brandSaveMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                    }`}>{brandSaveMsg.text}</span>
                  ) : <span />}
                  <button
                    type="submit"
                    disabled={isSavingBranding}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                  >
                    {isSavingBranding ? "Saving…" : "Save Branding"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Sandbox Simulator ── */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg w-full">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">CodePay Sandbox Simulator</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Generate a mock checkout to test redirection &amp; verification flow.</p>
              </div>
              {/* Inline form */}
              <form onSubmit={handleCreateSandboxPayment} className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">৳</span>
                  <input
                    type="number"
                    required
                    value={sandboxAmount}
                    onChange={(e) => setSandboxAmount(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 pl-7 pr-3 text-sm font-mono font-bold w-36 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    placeholder="Amount"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 transition cursor-pointer whitespace-nowrap"
                >
                  {isSimulating ? "Generating…" : "Generate Link"}
                </button>
              </form>
            </div>

            {/* Feedback */}
            {sandboxMessage && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-semibold border ${
                sandboxMessage.type === "success" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-red-500/10 text-red-300 border-red-500/20"
              }`}>{sandboxMessage.text}</div>
            )}

            {/* Generated URL panel */}
            {generatedSandboxUrl && (
              <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Generated Checkout URL</span>
                  <a
                    href={generatedSandboxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition"
                  >
                    Launch ↗
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedSandboxUrl.replace(window.location.origin, "https://pay.codeblend.co")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedSandboxUrl.replace(window.location.origin, "https://pay.codeblend.co"), "sandbox_url")}
                    className="px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold cursor-pointer text-white transition shrink-0"
                  >
                    {copiedField === "sandbox_url" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px] font-bold uppercase mb-0.5">Payment Channel</span>
                    <strong className="text-white text-xs">Any configured</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px] font-bold uppercase mb-0.5">Sender Phone</span>
                    <strong className="text-white text-xs">Any number</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px] font-bold uppercase mb-0.5">Sandbox TrxID</span>
                    <strong className="text-emerald-400 font-mono select-all text-xs">SANDBOX123</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {activeTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Generation and Sandbox Simulator */}
          <div className="lg:col-span-1 space-y-6">
            {/* Credentials Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">API Credentials</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Authenticate your PHP, JS, or other server requests securely.
                </p>
              </div>

              {!apiKey ? (
                <div className="text-center py-6 space-y-3">
                  <div className="flex items-center justify-center text-slate-400">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <p className="text-xs text-slate-400">No API Keys generated yet.</p>
                  <button
                    onClick={handleGenerateKeys}
                    disabled={isGeneratingKeys}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
                  >
                    Generate Keys
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                      API Key
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono select-all text-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(apiKey, "key")}
                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs transition font-semibold cursor-pointer"
                      >
                        {copiedField === "key" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                      API Secret
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type={showSecret ? "text" : "password"}
                        readOnly
                        value={apiSecret || ""}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono select-all text-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        {showSecret ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(apiSecret || "", "secret")}
                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs transition font-semibold cursor-pointer"
                      >
                        {copiedField === "secret" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                      Gateway Endpoint
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value="https://codeblend.co/api/v1/codepay/checkout"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard("https://codeblend.co/api/v1/codepay/checkout", "endpoint")}
                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs transition font-semibold cursor-pointer"
                      >
                        {copiedField === "endpoint" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateKeys}
                    disabled={isGeneratingKeys}
                    className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                  >
                    Regenerate API Keys
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Integration Guides */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 rounded-3xl p-6 text-white shadow-lg space-y-6 border border-slate-800/80">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white">API Integration Guide</h3>
                  <p className="text-xs text-slate-400 mt-0.5">How to request checkouts & verify payments</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSelectedLang("php")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      selectedLang === "php" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    PHP
                  </button>
                  <button
                    onClick={() => setSelectedLang("node")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      selectedLang === "node" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    NodeJS
                  </button>
                  <button
                    onClick={() => setSelectedLang("curl")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      selectedLang === "curl" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Curl
                  </button>
                </div>
              </div>

              {selectedLang === "php" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Use this script to initialize a checkout payment. It will return a <code>payment_url</code> which you redirect your customer to.
                  </p>
                  <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-850 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
{`<?php
$apiKey = "${apiKey || "YOUR_API_KEY"}";
$apiSecret = "${apiSecret || "YOUR_API_SECRET"}";

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://codeblend.co/api/v1/codepay/checkout",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode([
        "amount" => 1200,
        "order_id" => "ORDER_1001",
        "customer_name" => "John Doe",
        "customer_email" => "customer@email.com",
        "redirect_url" => "https://yourwebsite.com/payment/callback"
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "X-CodePay-API-Key: " . $apiKey,
        "X-CodePay-API-Secret: " . $apiSecret
    ],
]);

$response = json_decode(curl_exec($curl), true);
curl_close($curl);

if (isset($response['payment_url'])) {
    // Redirect Customer
    header("Location: " . $response['payment_url']);
    exit;
} else {
    echo "Payment Error: " . $response['message'];
}`}
                  </pre>
                </div>
              )}

              {selectedLang === "node" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Create payment checkouts dynamically in your Express/Next.js/Node API backend:
                  </p>
                  <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-850 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
{`const response = await fetch("https://codeblend.co/api/v1/codepay/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CodePay-API-Key": "${apiKey || "YOUR_API_KEY"}",
    "X-CodePay-API-Secret": "${apiSecret || "YOUR_API_SECRET"}"
  },
  body: JSON.stringify({
    amount: 1200,
    order_id: "ORDER_1001",
    customer_name: "John Doe",
    customer_email: "customer@email.com",
    redirect_url: "https://yourwebsite.com/payment/callback"
  })
});

const data = await response.json();
if (data.payment_url) {
  // Redirect visitor to hosted checkout
  res.redirect(data.payment_url);
} else {
  console.error("Payment failed", data.message);
}`}
                  </pre>
                </div>
              )}

              {selectedLang === "curl" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Quickly test checkout payment creation using curl directly in terminal:
                  </p>
                  <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-850 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
{`curl -X POST https://codeblend.co/api/v1/codepay/checkout \\
  -H "Content-Type: application/json" \\
  -H "X-CodePay-API-Key: ${apiKey || "YOUR_API_KEY"}" \\
  -H "X-CodePay-API-Secret: ${apiSecret || "YOUR_API_SECRET"}" \\
  -d '{
    "amount": 1200,
    "order_id": "ORDER_1001",
    "customer_name": "John Doe",
    "customer_email": "customer@email.com",
    "redirect_url": "https://yourwebsite.com/payment/callback"
  }'`}
                  </pre>
                </div>
              )}

              <hr className="border-slate-800" />

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">How Payment Verification Works</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon manual payment completion on the checkout screen, the customer submits their <strong>TrxID</strong>. CodePay immediately matches it with the sync log of incoming financial SMS parsed on your merchant's smartphone.
                  Once matched, the customer is redirected to your <code>redirect_url</code> with query params <code>?payment_id=[id]&status=completed&order_id=[order_id]</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
