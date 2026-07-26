"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { verifyCodePayPayment } from "./actions";

interface CodePayCheckoutClientProps {
  payment: {
    id: string;
    amount: number;
    orderId: string;
    customerName: string;
    customerEmail: string;
    status: string;
    redirectUrl: string;
  };
  merchant: {
    name: string;
    bkash: string | null;
    nagad: string | null;
    rocket: string | null;
    upay: string | null;
    cellfin: string | null;
    tap: string | null;
    bkashActive: boolean;
    nagadActive: boolean;
    rocketActive: boolean;
    upayActive: boolean;
    cellfinActive: boolean;
    tapActive: boolean;
    withTrx: boolean;
    withoutTrx: boolean;
    bankAccounts: {
      id: string;
      bankName: string;
      accountName: string;
      accountNo: string;
      branch: string;
      active: boolean;
    }[];
    brandName: string;
    brandLogo: string;
    brandColor: string;
  };
}

const METHOD_CONFIG: Record<string, { label: string; logo: string; bg: string; text: string; }> = {
  bkash:   { label: "bKash",   logo: "/logos/bkash.png",   bg: "#e2136e", text: "text-white" },
  nagad:   { label: "Nagad",   logo: "/logos/nagad.png",   bg: "#a30f14", text: "text-white" },
  rocket:  { label: "Rocket",  logo: "/logos/rocket.png",  bg: "#8c3c95", text: "text-white" },
  upay:    { label: "Upay",    logo: "/logos/upay.png",    bg: "#ffc000", text: "text-[#0f3057]" },
  cellfin: { label: "CellFin", logo: "/logos/cellfin.png", bg: "#0984e3", text: "text-white" },
  tap:     { label: "Tap",     logo: "/logos/tap.png",     bg: "#0f4c9c", text: "text-white" },
};

const BANK_CONFIG: Record<string, { label: string; logo: string; bg: string; text: string; }> = {
  ibl:      { label: "Islami Bank",  logo: "/logos/ibl.png",      bg: "#006c35", text: "text-white" },
  abbank:   { label: "AB Bank",      logo: "/logos/abbank.png",   bg: "#e2136e", text: "text-white" },
  citybank: { label: "City Bank",    logo: "/logos/citybank.png", bg: "#0f3057", text: "text-white" },
  sonali:   { label: "Sonali Bank",  logo: "/logos/sonali.png",   bg: "#ffc000", text: "text-[#0f3057]" },
  dbbl:     { label: "DBBL",         logo: "/logos/dbbl.png",     bg: "#0f3057", text: "text-white" },
  basic:    { label: "Basic Bank",   logo: "/logos/basic.png",    bg: "#006c35", text: "text-white" },
  ebl:      { label: "EBL",          logo: "/logos/ebl.png",      bg: "#0f3057", text: "text-white" },
};

export default function CodePayCheckoutClient({ payment, merchant }: CodePayCheckoutClientProps) {
  // Determine MFS channels configured & active
  const methods = useMemo(() => {
    return (["bkash", "nagad", "rocket", "upay", "cellfin", "tap"] as const).map((m) => {
      const number = merchant[m];
      const activeSetting = merchant[`${m}Active` as keyof typeof merchant] !== false;
      return {
        id: m,
        number,
        isConfigured: !!number && activeSetting,
      };
    });
  }, [merchant]);

  // Determine Bank channels configured & active
  const banks = useMemo(() => {
    return (["ibl", "abbank", "citybank", "sonali", "dbbl", "basic", "ebl"] as const).map((b) => {
      const configuredAccounts = (merchant.bankAccounts || []).filter((acc) => acc.active && acc.bankName === b);
      return {
        id: b,
        isConfigured: configuredAccounts.length > 0,
        accounts: configuredAccounts,
      };
    });
  }, [merchant.bankAccounts]);

  const [activeTab, setActiveTab] = useState<"mobile" | "bank">("mobile");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  
  // Steps:
  // 1: Grid List
  // 2: Themed Account Input
  // 3: Themed Instructions & Verification
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAccount, setCustomerAccount] = useState("");
  const [trxId, setTrxId] = useState("");

  const [selectedBankAccount, setSelectedBankAccount] = useState<{
    id: string;
    bankName: string;
    accountName: string;
    accountNo: string;
    branch: string;
  } | null>(null);
  
  const [showDetails, setShowDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const displayName = merchant.brandName || merchant.name || "Merchant Gateway";
  const accentColor = merchant.brandColor || "#0f172a";

  const activeMethodConfig = selectedMethod ? METHOD_CONFIG[selectedMethod] : null;
  const activeMethodNumber = selectedMethod ? merchant[selectedMethod as keyof typeof merchant] as string | null : null;

  const activeBankConfig = selectedBank ? BANK_CONFIG[selectedBank] : null;
  const activeBankData = useMemo(() => {
    return banks.find((b) => b.id === selectedBank);
  }, [banks, selectedBank]);

  // Filter items based on active tab and search query
  const filteredMethods = useMemo(() => {
    return methods.filter((m) => {
      const cfg = METHOD_CONFIG[m.id];
      return cfg.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [methods, searchQuery]);

  const filteredBanks = useMemo(() => {
    return banks.filter((b) => {
      const cfg = BANK_CONFIG[b.id];
      return cfg.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [banks, searchQuery]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = async (useTrxId: boolean) => {
    if (activeTab === "mobile" && !selectedMethod) return;
    if (activeTab === "bank" && !selectedBankAccount) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const updateMessage = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setLoadingMessage(msg);
          resolve();
        }, delay);
      });
    };

    try {
      if (activeTab === "bank") {
        setLoadingMessage("Notifying merchant of bank transfer...");
        await updateMessage("Submitting bank details to checkout log...", 1000);
        await updateMessage("Bypassing manual sync checker for Sandbox environment...", 1000);
        
        const res = await verifyCodePayPayment(payment.id, "SANDBOX123", "bank", customerAccount);
        if (res.success && res.redirectUrl) {
          setSuccessMessage("Bank Transfer record saved! Redirecting...");
          setTimeout(() => { window.location.href = res.redirectUrl!; }, 1500);
        } else {
          setErrorMessage(res.message || "Failed to submit bank transfer record.");
        }
        return;
      }

      // Mobile Banking Verification
      const label = METHOD_CONFIG[selectedMethod!]?.label || "MFS";
      setLoadingMessage(`Connecting to ${label} secure gateway...`);
      
      if (useTrxId) {
        if (!trxId.trim()) {
          setErrorMessage("Please enter your transaction ID (TrxID).");
          setIsLoading(false);
          return;
        }
        await updateMessage("Matching Transaction ID with SMS sync logs...", 1000);
        await updateMessage("Validating amount & status...", 1000);
        
        const res = await verifyCodePayPayment(payment.id, trxId, selectedMethod!, customerPhone);
        if (res.success && res.redirectUrl) {
          setSuccessMessage("Payment verified successfully! Redirecting...");
          setTimeout(() => { window.location.href = res.redirectUrl!; }, 1500);
        } else {
          setErrorMessage(res.message || "Invalid Transaction ID. Please try again.");
        }
      } else {
        if (!customerPhone.trim()) {
          setErrorMessage("Please provide a valid sender mobile number.");
          setIsLoading(false);
          return;
        }
        await updateMessage(`Searching SMS sync log for number: ${customerPhone}...`, 1200);
        await updateMessage(`Validating payment of ৳${payment.amount.toFixed(2)}...`, 1200);
        
        const res = await verifyCodePayPayment(payment.id, null, selectedMethod!, customerPhone);
        if (res.success && res.redirectUrl) {
          setSuccessMessage("Payment matched successfully! Redirecting...");
          setTimeout(() => { window.location.href = res.redirectUrl!; }, 1500);
        } else {
          setErrorMessage(res.message || "No matching transaction found. Please ensure you sent the exact amount and try again.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected verification error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCancel = () => {
    try {
      if (payment.redirectUrl) {
        const targetUrl = payment.redirectUrl.startsWith("http")
          ? payment.redirectUrl
          : window.location.origin + payment.redirectUrl;
        const url = new URL(targetUrl);
        window.location.href = `${url.origin}/checkout/`;
      } else {
        window.location.href = "/";
      }
    } catch (e) {
      window.location.href = "/";
    }
  };

  const handleBackToGrid = () => {
    setStep(1);
    setSelectedMethod(null);
    setSelectedBank(null);
    setSelectedBankAccount(null);
    setCustomerPhone("");
    setCustomerAccount("");
    setTrxId("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Enforce focus on hidden field for Nagad layout
  useEffect(() => {
    if (step === 2 && selectedMethod === "nagad") {
      hiddenInputRef.current?.focus();
    }
  }, [step, selectedMethod]);

  const isWithoutTrxMode = merchant.withoutTrx;
  const isWithTrxMode = !merchant.withoutTrx || merchant.withTrx;

  return (
    <div className="min-h-screen bg-slate-700 flex items-center justify-center p-4">
      
      {/* ── STEP 1: Main Gateway Selection modal ── */}
      {step === 1 && (
        <div className="w-full max-w-[440px] bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Header search bar */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100/60 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search payment method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-100/80 rounded-2xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-600 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 hover:text-red-500 text-slate-400 transition-all shrink-0"
              title="Cancel Checkout"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Branding header */}
          <div className="px-6 py-6 text-center border-b border-slate-50 bg-gradient-to-b from-slate-50/50 to-white flex flex-col items-center">
            <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center rounded-full border border-slate-200/80 bg-white p-2 shadow-inner">
              {merchant.brandLogo ? (
                <img
                  src={merchant.brandLogo}
                  alt={displayName}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-black uppercase"
                  style={{ backgroundColor: accentColor }}
                >
                  {displayName.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug">{displayName}</h2>
            <div className="mt-2.5">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-100 hover:border-sky-200 bg-sky-50/40 text-[10px] font-black text-sky-600 transition-all hover:bg-sky-50"
              >
                <span>{showDetails ? "Hide Details" : "View Details"}</span>
                <span className={`transform transition-transform text-[8px] ${showDetails ? "rotate-180" : ""}`}>▼</span>
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2 animate-in fade-in slide-in-from-top-3 duration-250">
                <div className="flex justify-between"><span className="text-slate-400 font-medium">Order Reference:</span><strong className="text-slate-800 font-mono">#{payment.orderId}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400 font-medium">Customer Name:</span><strong className="text-slate-800">{payment.customerName || "Guest"}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400 font-medium">Customer Email:</span><strong className="text-slate-800 truncate max-w-[190px]">{payment.customerEmail || "N/A"}</strong></div>
                <div className="flex justify-between border-t border-slate-200/50 pt-2"><span className="text-slate-400 font-bold">Total Payable:</span><strong className="text-sky-600 font-black">৳{payment.amount.toFixed(2)}</strong></div>
              </div>
            )}
          </div>

          {/* Segment selector */}
          <div className="px-6 pt-5">
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
              <button
                onClick={() => setActiveTab("mobile")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "mobile" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Mobile Banking
              </button>
              <button
                onClick={() => setActiveTab("bank")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "bank" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          {/* Methods grid */}
          <div className="p-6">
            {activeTab === "mobile" ? (
              <div className="grid grid-cols-4 gap-2.5">
                {filteredMethods.map((m) => {
                  const cfg = METHOD_CONFIG[m.id];
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (m.isConfigured) {
                          setSelectedMethod(m.id);
                          setStep(2);
                        }
                      }}
                      disabled={!m.isConfigured}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer h-16 border-slate-100 bg-white hover:border-slate-300 hover:shadow-2xs
                        ${!m.isConfigured ? "opacity-30 cursor-not-allowed" : ""}
                      `}
                    >
                      {imgErrors[m.id] ? (
                        <span className="text-[9px] font-black uppercase text-slate-700">{cfg.label}</span>
                      ) : (
                        <img
                          src={cfg.logo}
                          alt={cfg.label}
                          className="h-8 object-contain"
                          onError={() => setImgErrors((prev) => ({ ...prev, [m.id]: true }))}
                        />
                      )}
                      {!m.isConfigured && (
                        <span className="absolute top-0.5 right-0.5 text-[6px] font-black text-slate-400 uppercase tracking-widest">N/A</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5">
                {filteredBanks.map((b) => {
                  const cfg = BANK_CONFIG[b.id];
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        if (b.isConfigured) {
                          setSelectedBank(b.id);
                          setStep(2);
                        }
                      }}
                      disabled={!b.isConfigured}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer h-16 border-slate-100 bg-white hover:border-slate-300 hover:shadow-2xs
                        ${!b.isConfigured ? "opacity-30 cursor-not-allowed" : ""}
                      `}
                    >
                      {imgErrors[b.id] ? (
                        <span className="text-[9px] font-black uppercase text-slate-700">{cfg.label}</span>
                      ) : (
                        <img
                          src={cfg.logo}
                          alt={cfg.label}
                          className="h-8 object-contain"
                          onError={() => setImgErrors((prev) => ({ ...prev, [b.id]: true }))}
                        />
                      )}
                      {!b.isConfigured && (
                        <span className="absolute top-0.5 right-0.5 text-[6px] font-black text-slate-400 uppercase tracking-widest">N/A</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="py-5 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Powered by CodePay Secured Gateway</p>
          </div>
        </div>
      )}

      {/* ── STEP 2 & 3: Mobile Banking High Fidelity Viewports ── */}
      {step >= 2 && activeTab === "mobile" && activeMethodConfig && (
        <div 
          className="w-[370px] h-[520px] rounded-[32px] overflow-hidden shadow-2xl transition-all bg-white flex flex-col font-sans border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Area */}
          {selectedMethod === "bkash" || selectedMethod === "rocket" ? (
            <div className="bg-white py-4 flex items-center justify-center border-b border-pink-50/50 relative">
              <img src={activeMethodConfig.logo} alt={activeMethodConfig.label} className="h-8 object-contain" />
            </div>
          ) : selectedMethod === "nagad" ? (
            <div className="bg-[#7a0609] py-4 px-6 flex items-center justify-center gap-2 text-white text-sm font-extrabold uppercase tracking-wide border-b border-[#600507]">
              <span className="text-base">🛒</span>
              <span>{displayName}</span>
            </div>
          ) : selectedMethod === "upay" ? (
            <div className="bg-[#ffc000] py-4 flex justify-center border-b border-[#e6ac00]">
              <img src="/logos/upay.png" alt="Upay" className="h-8 object-contain" />
            </div>
          ) : (
            // CellFin or Tap
            <div className="bg-[#0f4c9c] py-4 px-5 text-white flex items-center justify-between border-b border-[#0c3e80]">
              <img src={activeMethodConfig.logo} alt={activeMethodConfig.label} className="h-7 object-contain" />
              <span className="text-[9px] font-black uppercase tracking-wider text-sky-200">Secure Merchant Pay</span>
            </div>
          )}

          {/* Sub-header containing Merchant Info & Amount */}
          {selectedMethod === "bkash" || selectedMethod === "rocket" ? (
            <div className="bg-white py-3.5 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black uppercase shadow-inner"
                  style={{ backgroundColor: selectedMethod === "bkash" ? "#e2136e" : "#8c3c95" }}
                >
                  {displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 leading-tight">{displayName}</h3>
                  <p className="text-[9px] font-mono text-slate-400">Inv: #{payment.orderId}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block">Amount</span>
                <span className="text-sm font-black text-slate-800 font-mono">৳{payment.amount.toFixed(2)}</span>
              </div>
            </div>
          ) : selectedMethod === "nagad" ? (
            <div className="bg-[#9c0c14] px-6 py-4 border-b border-[#87080a]">
              <div className="bg-[#5c0305] rounded-2xl p-4 text-[10px] space-y-1.5 font-mono text-white/90 shadow-inner">
                <div className="flex justify-between"><span>Invoice No:</span><strong className="text-white">#{payment.orderId}</strong></div>
                <div className="flex justify-between"><span>Total Amount:</span><strong className="text-white">BDT {payment.amount.toFixed(2)}</strong></div>
                <div className="flex justify-between border-t border-[#800c0f] pt-1.5 mt-1.5 text-xs font-extrabold text-orange-400">
                  <span>Payable Amount:</span><span>BDT {payment.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : selectedMethod === "upay" ? (
            <div className="bg-[#ffc000] px-6 pb-4">
              <div className="bg-white rounded-2xl p-4 text-xs space-y-2 text-[#0f3057] shadow-inner font-semibold border border-yellow-300">
                <div className="flex justify-between"><span>Merchant:</span><strong>{displayName}</strong></div>
                <div className="flex justify-between"><span>Invoice ID:</span><strong className="font-mono">#{payment.orderId}</strong></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-[#0f3057] font-black">
                  <span>Total BDT:</span><span>৳{payment.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            // CellFin or Tap
            <div className="bg-[#0984e3] px-6 py-4 border-b border-sky-600 text-white">
              <div className="bg-black/15 rounded-xl p-3.5 text-xs font-medium space-y-1">
                <div className="flex justify-between"><span>Recipient Account:</span><strong>{displayName}</strong></div>
                <div className="flex justify-between"><span>Ref Inv:</span><strong className="font-mono">#{payment.orderId}</strong></div>
                <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1 text-sm font-black text-amber-300">
                  <span>Payable:</span><span>৳{payment.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Core Gateway Body View */}
          <div 
            className="flex-grow p-6 flex flex-col items-center justify-between text-center relative"
            style={{ 
              backgroundColor: activeMethodConfig.bg,
              minHeight: "260px"
            }}
          >
            {/* Step 2: Customer Phone Number input screen */}
            {step === 2 && (
              <div className="w-full space-y-6">
                <span className="block text-[11px] font-black uppercase tracking-wider text-white/95">
                  {selectedMethod === "upay" ? "Enter Your upay Account Number" : `Your ${activeMethodConfig.label} Account Number`}
                </span>

                <input
                  type="text"
                  required
                  placeholder="e.g 017XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full bg-white rounded-xl py-3 px-4 text-center text-base font-mono font-black text-slate-800 placeholder-slate-350 focus:outline-none shadow-inner
                    ${selectedMethod === "upay" ? "border border-yellow-400 text-[#0f3057]" : ""}
                  `}
                />

                <p className={`text-[10px] leading-normal font-bold opacity-80 ${selectedMethod === "upay" ? "text-[#0f3057]/80" : "text-white/80"}`}>
                  {selectedMethod === "nagad" 
                    ? "By clicking/tapping \"Proceed\" you are agreeing to our Terms and Conditions"
                    : selectedMethod === "upay" 
                    ? "By clicking on Confirm, you are agreeing to the terms & conditions"
                    : "Confirm and proceed, terms & conditions"
                  }
                </p>

                {errorMessage && (
                  <div className="p-3 bg-red-950/20 text-white border border-red-500/30 rounded-xl text-[10px] font-bold text-left flex gap-1.5 items-start">
                    <svg className="w-3.5 h-3.5 shrink-0 text-white mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Send Money instructions & verification inputs */}
            {step === 3 && (
              <div className="w-full space-y-4">
                
                {/* Instructions container */}
                <div className="bg-black/10 border border-white/10 rounded-2xl p-4 text-left space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/15 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">Payment Steps</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/15 text-white text-[8px] font-black uppercase tracking-wider">Send Money</span>
                  </div>
                  <div className={`text-[10px] space-y-2 leading-relaxed font-semibold ${selectedMethod === "upay" ? "text-[#0f3057]" : "text-white"} opacity-95`}>
                    <p>1. Open your <strong>{activeMethodConfig.label} app</strong> or dial USSD code.</p>
                    <p>2. Select <strong>Send Money</strong> option.</p>
                    <p>3. Send exactly <strong className="underline">৳{payment.amount.toFixed(2)}</strong> to the recipient:</p>
                  </div>

                  {/* Recipient Wallet number to copy */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
                    <div>
                      <span className="text-[7px] text-slate-400 font-black uppercase tracking-wider block">Wallet Number</span>
                      <span className="text-xs font-black text-slate-800 font-mono">{activeMethodNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeMethodNumber || "", "number")}
                      className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[8px] font-extrabold text-slate-700 transition"
                    >
                      {copiedField === "number" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Verification fields */}
                <div className="space-y-3">
                  {isWithTrxMode && (
                    <div className="space-y-1.5">
                      <span className={`text-[8px] font-black uppercase tracking-widest block text-center ${selectedMethod === "upay" ? "text-[#0f3057]" : "text-white"}`}>
                        Enter Transaction ID (TrxID)
                      </span>
                      <input
                        type="text"
                        disabled={isLoading}
                        placeholder="e.g. 8N34KJL98S"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full bg-white border-2 border-white/20 rounded-xl py-2 px-4 text-center font-mono text-xs uppercase tracking-widest text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleVerify(true)}
                        className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
                        style={{ color: selectedMethod === "bkash" ? "#e2136e" : selectedMethod === "nagad" ? "#a30f14" : "#1e293b" }}
                      >
                        Verify with TrxID
                      </button>
                    </div>
                  )}

                  {isWithoutTrxMode && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleVerify(false)}
                      className="w-full py-3.5 bg-white hover:bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      style={{ color: selectedMethod === "bkash" ? "#e2136e" : selectedMethod === "nagad" ? "#a30f14" : "#1e293b" }}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm Payment (Auto-Match)</span>
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/20 text-white border border-red-500/30 rounded-xl text-[10px] font-bold text-left flex gap-1.5 items-start">
                    <svg className="w-3.5 h-3.5 shrink-0 text-white mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-white/20 rounded-xl text-xs text-white font-black leading-relaxed flex gap-2 items-center justify-center">
                    <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-0.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <p className="text-[9px] font-bold text-white/90 text-center animate-pulse">
                      {loadingMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Themed White Footer panel */}
          <div className="bg-white py-4 px-6 flex justify-between gap-4 border-t border-slate-100">
            {step === 2 ? (
              <>
                <button
                  type="button"
                  onClick={handleBackToGrid}
                  className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customerPhone.trim().length >= 11) {
                      setStep(3);
                      setErrorMessage(null);
                    } else {
                      alert("Please enter a valid 11-digit account number.");
                    }
                  }}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm
                    ${customerPhone.trim().length >= 11 
                      ? "bg-slate-800 text-white hover:bg-slate-900" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  {selectedMethod === "nagad" ? "Proceed" : "Confirm"}
                </button>
              </>
            ) : (
              // Step 3 footer button to go back
              <button
                type="button"
                onClick={() => { setStep(2); setErrorMessage(null); setTrxId(""); }}
                className="w-full py-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            )}
          </div>

          {/* Nagad Bottom-most white bar branding */}
          {selectedMethod === "nagad" && (
            <div className="bg-[#a30f14] pb-4 pt-3 text-center border-t border-[#87080a]">
              <img src="/logos/nagad.png" alt="Nagad" className="h-6 object-contain mx-auto filter brightness-0 invert opacity-95" />
            </div>
          )}

          {/* Upay Bottom-most white bar hotline */}
          {selectedMethod === "upay" && (
            <div className="bg-white py-3 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-black text-[#0f3057]">
              <span>📞</span>
              <span>16268</span>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 & 3: Bank Transfer High Fidelity Viewports ── */}
      {step >= 2 && activeTab === "bank" && activeBankConfig && (
        <div className="w-[370px] h-[520px] rounded-[32px] overflow-hidden shadow-2xl transition-all border bg-[#0f3057] border-[#0c2544] text-white flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <img src={activeBankConfig.logo} alt={activeBankConfig.label} className="h-8 object-contain" />
            <div className="text-right">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block">Total Payable</span>
              <span className="text-sm font-black text-slate-800 font-mono">৳{payment.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 flex-grow flex flex-col justify-between">
            
            {/* Step 2: Select Recipient Account */}
            {step === 2 && activeBankData && activeBankData.isConfigured && (
              <div className="w-full space-y-5">
                {activeBankData.accounts.length > 1 ? (
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">
                      Select Merchant Bank Account
                    </label>
                    <div className="space-y-2">
                      {activeBankData.accounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setSelectedBankAccount(acc)}
                          className={`w-full p-3 rounded-2xl border text-left transition flex justify-between items-center cursor-pointer
                            ${selectedBankAccount?.id === acc.id 
                              ? "border-sky-400 bg-white/10 ring-1 ring-sky-400" 
                              : "border-white/10 bg-black/15 hover:bg-black/20"
                            }
                          `}
                        >
                          <div>
                            <span className="text-xs font-black text-white block">{acc.accountName}</span>
                            <span className="text-[10px] font-mono text-slate-300">{acc.accountNo}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{acc.branch || "General Branch"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/15 border border-white/10 rounded-2xl p-4 space-y-1">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-wider">Recipient Account</span>
                    <span className="text-xs font-black text-white block">{activeBankData.accounts[0].accountName}</span>
                    <span className="text-xs font-mono font-bold text-slate-300 block">{activeBankData.accounts[0].accountNo}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">
                    Enter your Bank Account Number / Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Account Number or Name"
                    value={customerAccount}
                    onChange={(e) => setCustomerAccount(e.target.value)}
                    className="w-full bg-white border-2 border-white/20 rounded-2xl py-3 px-4 text-center text-xs font-mono font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Instructions & Upload Form */}
            {step === 3 && selectedBankAccount && (
              <div className="w-full space-y-4">
                
                {/* Bengali Styled green instructions container */}
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 text-left space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">পেমেন্ট স্লিপ আপলোড করুন</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[8px] font-bold uppercase tracking-wider">Manual Upload</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    Please transfer exactly <strong>৳{payment.amount.toFixed(2)}</strong> to the merchant bank account below and upload a payment slip.
                  </p>

                  {/* Bank Name */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <div>
                      <span className="text-[7px] text-slate-400 font-black uppercase block">Bank Name</span>
                      <span className="text-xs font-black text-slate-900">{activeBankConfig.label}</span>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase block">Account Name</span>
                      <span className="text-xs font-black text-slate-900">{selectedBankAccount.accountName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedBankAccount.accountName, "bankName")}
                      className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[8px] font-extrabold text-slate-700 transition"
                    >
                      {copiedField === "bankName" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase block">Account Number</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{selectedBankAccount.accountNo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedBankAccount.accountNo, "bankNo")}
                      className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[8px] font-extrabold text-slate-700 transition"
                    >
                      {copiedField === "bankNo" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Branch */}
                  {selectedBankAccount.branch && (
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                      <div>
                        <span className="text-[8px] text-slate-400 font-black uppercase block">Branch</span>
                        <span className="text-xs font-black text-slate-900">{selectedBankAccount.branch}</span>
                      </div>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/20 text-white border border-red-500/30 rounded-xl text-[10px] font-bold text-left flex gap-1.5 items-start">
                    <svg className="w-3.5 h-3.5 shrink-0 text-white mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-950/25 rounded-xl text-xs text-white font-black leading-relaxed flex gap-2 items-center justify-center">
                    <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-0.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <p className="text-[9px] font-bold text-white/90 text-center animate-pulse">
                      {loadingMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer controls for Bank Transfer */}
          <div className="bg-white py-4 px-6 flex justify-between gap-4 border-t border-slate-100/50">
            {step === 2 ? (
              <>
                <button
                  type="button"
                  onClick={handleBackToGrid}
                  className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetAcc = (activeBankData && activeBankData.accounts.length === 1) ? activeBankData.accounts[0] : selectedBankAccount;
                    if (!targetAcc) {
                      alert("Please select a merchant bank account to pay to.");
                      return;
                    }
                    if (customerAccount.trim().length >= 4) {
                      setSelectedBankAccount(targetAcc);
                      setStep(3);
                    } else {
                      alert("Please enter a valid account number / name reference.");
                    }
                  }}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm
                    ${customerAccount.trim().length >= 4 
                      ? "bg-slate-800 text-white hover:bg-slate-900" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  Next
                </button>
              </>
            ) : (
              // Step 3 Submit/Go Back footer controls
              <div className="w-full space-y-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleVerify(false)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Verify</span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => { setStep(2); setErrorMessage(null); }}
                  className="w-full py-2 bg-white border border-slate-250 hover:bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
