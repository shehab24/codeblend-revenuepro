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
    bkashType: "personal" | "merchant";
    bkashQr: string;
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

// Brand themes: gradient (from → to), text on gradient (ink), accent readable on white, and a soft tint
const METHOD_CONFIG: Record<string, { label: string; logo: string } & BrandTheme> = {
  bkash:   { label: "bKash",   logo: "/logos/bkash.png",   from: "#e2136e", to: "#a3094e", ink: "#ffffff", accent: "#d1105f", soft: "rgba(226,19,110,0.10)" },
  nagad:   { label: "Nagad",   logo: "/logos/nagad.png",   from: "#f26522", to: "#c8102e", ink: "#ffffff", accent: "#d9331f", soft: "rgba(236,28,36,0.10)" },
  rocket:  { label: "Rocket",  logo: "/logos/rocket.png",  from: "#9b3fa6", to: "#5b1f66", ink: "#ffffff", accent: "#8c3c95", soft: "rgba(140,60,149,0.10)" },
  upay:    { label: "Upay",    logo: "/logos/upay.png",    from: "#ffd23f", to: "#f5a700", ink: "#0f3057", accent: "#0f3057", soft: "rgba(255,192,0,0.16)" },
  cellfin: { label: "CellFin", logo: "/logos/cellfin.png", from: "#1fa463", to: "#0b6b3a", ink: "#ffffff", accent: "#138a4e", soft: "rgba(31,164,99,0.10)" },
  tap:     { label: "Tap",     logo: "/logos/tap.png",     from: "#2f6fd6", to: "#0f3f8c", ink: "#ffffff", accent: "#1f5bbf", soft: "rgba(47,111,214,0.10)" },
};

const BANK_THEME: BrandTheme = { from: "#1e3a8a", to: "#0b1a3d", ink: "#ffffff", accent: "#1e40af", soft: "rgba(30,64,175,0.10)" };

const BANK_CONFIG: Record<string, { label: string; logo: string } & BrandTheme> = {
  ibl:      { label: "Islami Bank",  logo: "/logos/ibl.png",      ...BANK_THEME },
  abbank:   { label: "AB Bank",      logo: "/logos/abbank.png",   ...BANK_THEME },
  citybank: { label: "City Bank",    logo: "/logos/citybank.png", ...BANK_THEME },
  sonali:   { label: "Sonali Bank",  logo: "/logos/sonali.png",   ...BANK_THEME },
  dbbl:     { label: "DBBL",         logo: "/logos/dbbl.png",     ...BANK_THEME },
  basic:    { label: "Basic Bank",   logo: "/logos/basic.png",    ...BANK_THEME },
  ebl:      { label: "EBL",          logo: "/logos/ebl.png",      ...BANK_THEME },
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

  // bKash merchant accounts are paid via "Payment" (optionally by scanning the merchant QR), not "Send Money"
  const isBkashMerchant = selectedMethod === "bkash" && merchant.bkashType === "merchant";
  const merchantQr = isBkashMerchant ? merchant.bkashQr : "";
  const qrDownloadUrl = merchantQr && merchantQr.includes("ik.imagekit.io")
    ? `${merchantQr}${merchantQr.includes("?") ? "&" : "?"}ik-attachment=true`
    : merchantQr;


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
    navigator.clipboard?.writeText(text);
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

  const handleConfirmAccount = () => {
    if (/^01\d{9}$/.test(customerPhone)) {
      setStep(3);
      setErrorMessage(null);
    } else {
      setErrorMessage("Please enter a valid 11-digit mobile number starting with 01.");
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

      {/* ── STEP 2 & 3: Mobile Banking (shared premium shell, themed per wallet) ── */}
      {step >= 2 && activeTab === "mobile" && activeMethodConfig && (
        <PaymentShell
          theme={activeMethodConfig}
          logo={activeMethodConfig.logo}
          logoAlt={activeMethodConfig.label}
          merchantName={displayName}
          orderId={payment.orderId}
          amount={payment.amount}
          step={step}
          stepTitle={step === 2 ? "Your account" : "Pay & verify"}
          footer={
            step === 2 ? (
              <>
                <SecondaryButton onClick={handleBackToGrid}>Cancel</SecondaryButton>
                <PrimaryButton theme={activeMethodConfig} onClick={handleConfirmAccount} disabled={customerPhone.length !== 11}>
                  {selectedMethod === "nagad" ? "Proceed" : "Continue"}
                </PrimaryButton>
              </>
            ) : (
              <>
                <BackIconButton disabled={isLoading} onClick={() => { setStep(2); setErrorMessage(null); setTrxId(""); }} />
                <PrimaryButton
                  theme={activeMethodConfig}
                  disabled={isLoading || (isWithTrxMode && !trxId)}
                  onClick={() => handleVerify(isWithTrxMode)}
                >
                  {isLoading ? <Spinner /> : <ShieldIcon />}
                  <span>{isLoading ? "Verifying..." : isWithTrxMode ? "Verify Payment" : "I've Paid — Verify"}</span>
                </PrimaryButton>
              </>
            )
          }
        >
          {/* Step 2: Customer Phone Number input screen */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Enter your {activeMethodConfig.label} number
                </h4>
                <p className="text-xs text-slate-500 mt-1">The wallet number you&apos;ll send the payment from.</p>
              </div>

              <ThemedInput
                id="cp-customer-phone"
                theme={activeMethodConfig}
                icon={<PhoneIcon />}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                maxLength={11}
                placeholder="01XXXXXXXXX"
                value={customerPhone}
                onChange={(e) => { setCustomerPhone(e.target.value.replace(/\D/g, "")); setErrorMessage(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmAccount(); }}
                className="text-lg tracking-[0.18em]"
              />

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By tapping &quot;{selectedMethod === "nagad" ? "Proceed" : "Continue"}&quot; you agree to the terms &amp; conditions.
              </p>

              {errorMessage && <CheckoutAlert tone="error" message={errorMessage} />}
            </div>
          )}

          {/* Step 3: Send Money / Merchant Payment instructions & verification inputs */}
          {step === 3 && (
            <div className="space-y-5">
              <ol className="space-y-2.5 text-[13px] text-slate-600 leading-snug">
                {(isBkashMerchant
                  ? [
                      <>Open your <strong className="text-slate-900">bKash</strong> app.</>,
                      merchantQr
                        ? <>Tap <strong className="text-slate-900">Scan QR</strong> and scan the code below, or choose <strong className="text-slate-900">Payment</strong> and enter the merchant number.</>
                        : <>Choose <strong className="text-slate-900">Payment</strong> and enter the merchant number below.</>,
                      <>Pay exactly <strong className="text-slate-900">৳{payment.amount.toFixed(2)}</strong> and confirm with your PIN.</>,
                    ]
                  : [
                      <>Open your <strong className="text-slate-900">{activeMethodConfig.label}</strong> app or dial the USSD code.</>,
                      <>Choose <strong className="text-slate-900">Send Money</strong>.</>,
                      <>Send exactly <strong className="text-slate-900">৳{payment.amount.toFixed(2)}</strong> to the number below.</>,
                    ]
                ).map((content, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span
                      className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ backgroundColor: activeMethodConfig.soft, color: activeMethodConfig.accent }}
                    >
                      {i + 1}
                    </span>
                    <span className="pt-px">{content}</span>
                  </li>
                ))}
              </ol>

              {/* Merchant QR code (bKash merchant accounts only) */}
              {merchantQr && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scan to pay</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: activeMethodConfig.soft, color: activeMethodConfig.accent }}
                    >
                      bKash Merchant
                    </span>
                  </div>
                  <div
                    className="mx-auto w-44 h-44 max-w-full rounded-2xl p-2 bg-white"
                    style={{ boxShadow: `0 0 0 2px ${activeMethodConfig.accent}` }}
                  >
                    <img src={merchantQr} alt={`${displayName} bKash merchant QR code`} className="w-full h-full object-contain" />
                  </div>
                  <a
                    href={qrDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold transition hover:opacity-80"
                    style={{ color: activeMethodConfig.accent }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    On this phone? Save QR → &quot;Scan from gallery&quot;
                  </a>
                </div>
              )}

              {/* Recipient wallet number to copy */}
              <div
                className="rounded-2xl border border-dashed p-4 flex items-center justify-between gap-3"
                style={{ borderColor: activeMethodConfig.accent, backgroundColor: activeMethodConfig.soft }}
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {isBkashMerchant ? "Merchant number" : "Send money to"}
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono tracking-wider break-all">{activeMethodNumber}</span>
                </div>
                <CopyButton
                  theme={activeMethodConfig}
                  copied={copiedField === "number"}
                  onCopy={() => copyToClipboard(activeMethodNumber || "", "number")}
                />
              </div>

              {isWithTrxMode && (
                <div className="space-y-2">
                  <label htmlFor="cp-trxid" className="text-xs font-bold text-slate-700 block">
                    Transaction ID (TrxID)
                  </label>
                  <ThemedInput
                    id="cp-trxid"
                    theme={activeMethodConfig}
                    icon={<ReceiptIcon />}
                    type="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    disabled={isLoading}
                    placeholder="e.g. 8N34KJL98S"
                    value={trxId}
                    onChange={(e) => { setTrxId(e.target.value.toUpperCase().trim()); setErrorMessage(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleVerify(true); }}
                    className="text-sm uppercase tracking-[0.2em] placeholder:normal-case placeholder:tracking-normal"
                  />
                  <p className="text-[11px] text-slate-400">You&apos;ll find it in the confirmation SMS from {activeMethodConfig.label}.</p>
                </div>
              )}

              {isWithTrxMode && isWithoutTrxMode && (
                <>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex-1 h-px bg-slate-200" />
                    or
                    <span className="flex-1 h-px bg-slate-200" />
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleVerify(false)}
                    className="w-full py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verify without TrxID (auto-match)</span>
                  </button>
                </>
              )}

              {errorMessage && <CheckoutAlert tone="error" message={errorMessage} />}
              {successMessage && <CheckoutAlert tone="success" message={successMessage} />}

              {isLoading && loadingMessage && (
                <p className="text-[11px] font-semibold text-center text-slate-500 animate-pulse">{loadingMessage}</p>
              )}
            </div>
          )}
        </PaymentShell>
      )}

      {/* ── STEP 2 & 3: Bank Transfer (same premium shell) ── */}
      {step >= 2 && activeTab === "bank" && activeBankConfig && (
        <PaymentShell
          theme={activeBankConfig}
          logo={activeBankConfig.logo}
          logoAlt={activeBankConfig.label}
          merchantName={displayName}
          orderId={payment.orderId}
          amount={payment.amount}
          step={step}
          stepTitle={step === 2 ? "Recipient & reference" : "Transfer & submit"}
          footer={
            step === 2 ? (
              <>
                <SecondaryButton onClick={handleBackToGrid}>Cancel</SecondaryButton>
                <PrimaryButton
                  theme={activeBankConfig}
                  disabled={customerAccount.trim().length < 4}
                  onClick={() => {
                    const targetAcc = (activeBankData && activeBankData.accounts.length === 1) ? activeBankData.accounts[0] : selectedBankAccount;
                    if (!targetAcc) {
                      setErrorMessage("Please select a merchant bank account to pay to.");
                      return;
                    }
                    if (customerAccount.trim().length >= 4) {
                      setSelectedBankAccount(targetAcc);
                      setErrorMessage(null);
                      setStep(3);
                    } else {
                      setErrorMessage("Please enter a valid account number / name reference.");
                    }
                  }}
                >
                  Continue
                </PrimaryButton>
              </>
            ) : (
              <>
                <BackIconButton disabled={isLoading} onClick={() => { setStep(2); setErrorMessage(null); }} />
                <PrimaryButton theme={activeBankConfig} disabled={isLoading} onClick={() => handleVerify(false)}>
                  {isLoading ? <Spinner /> : <ShieldIcon />}
                  <span>{isLoading ? "Submitting..." : "I've Transferred"}</span>
                </PrimaryButton>
              </>
            )
          }
        >
          {/* Step 2: Select Recipient Account */}
          {step === 2 && activeBankData && activeBankData.isConfigured && (
            <div className="space-y-5">
              {activeBankData.accounts.length > 1 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Select merchant account</span>
                  {activeBankData.accounts.map((acc) => {
                    const isSelected = selectedBankAccount?.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => { setSelectedBankAccount(acc); setErrorMessage(null); }}
                        className="w-full p-3.5 rounded-2xl border text-left transition flex justify-between items-center gap-3 cursor-pointer hover:bg-slate-50"
                        style={isSelected ? { borderColor: activeBankConfig.accent, backgroundColor: activeBankConfig.soft, boxShadow: `0 0 0 1px ${activeBankConfig.accent}` } : { borderColor: "#e2e8f0" }}
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-slate-900 block truncate">{acc.accountName}</span>
                          <span className="text-xs font-mono text-slate-500">{acc.accountNo}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold shrink-0">{acc.branch || "General Branch"}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Recipient account</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{activeBankData.accounts[0].accountName}</span>
                  <span className="text-xs font-mono text-slate-500 block">{activeBankData.accounts[0].accountNo}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="cp-bank-ref" className="text-xs font-bold text-slate-700 block">
                  Your bank account number / reference
                </label>
                <ThemedInput
                  id="cp-bank-ref"
                  theme={activeBankConfig}
                  icon={<ReceiptIcon />}
                  type="text"
                  placeholder="Account number or name"
                  value={customerAccount}
                  onChange={(e) => { setCustomerAccount(e.target.value); setErrorMessage(null); }}
                  className="text-sm"
                />
              </div>

              {errorMessage && <CheckoutAlert tone="error" message={errorMessage} />}
            </div>
          )}

          {/* Step 3: Bank details & submit */}
          {step === 3 && selectedBankAccount && (
            <div className="space-y-4">
              <p className="text-[13px] text-slate-600 leading-snug">
                Transfer exactly <strong className="text-slate-900">৳{payment.amount.toFixed(2)}</strong> to the account below, then tap <strong className="text-slate-900">I&apos;ve Transferred</strong>.
              </p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 divide-y divide-slate-200">
                <CopyRow label="Bank" value={activeBankConfig.label} />
                <CopyRow
                  label="Account name"
                  value={selectedBankAccount.accountName}
                  theme={activeBankConfig}
                  copied={copiedField === "bankName"}
                  onCopy={() => copyToClipboard(selectedBankAccount.accountName, "bankName")}
                />
                <CopyRow
                  label="Account number"
                  value={selectedBankAccount.accountNo}
                  mono
                  theme={activeBankConfig}
                  copied={copiedField === "bankNo"}
                  onCopy={() => copyToClipboard(selectedBankAccount.accountNo, "bankNo")}
                />
                {selectedBankAccount.branch && <CopyRow label="Branch" value={selectedBankAccount.branch} />}
              </div>

              {errorMessage && <CheckoutAlert tone="error" message={errorMessage} />}
              {successMessage && <CheckoutAlert tone="success" message={successMessage} />}

              {isLoading && loadingMessage && (
                <p className="text-[11px] font-semibold text-center text-slate-500 animate-pulse">{loadingMessage}</p>
              )}
            </div>
          )}
        </PaymentShell>
      )}

    </div>
  );
}

type BrandTheme = {
  from: string;   // gradient start
  to: string;     // gradient end
  ink: string;    // text color on the gradient
  accent: string; // brand color readable on white
  soft: string;   // translucent accent for tints
};

const brandGradient = (t: BrandTheme) => `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`;

function PaymentShell({
  theme, logo, logoAlt, merchantName, orderId, amount, step, stepTitle, footer, children,
}: {
  theme: BrandTheme;
  logo: string;
  logoAlt: string;
  merchantName: string;
  orderId: string;
  amount: number;
  step: number;
  stepTitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const current = step - 1; // steps 2 & 3 → 1 & 2
  return (
    <div className="w-full max-w-[400px] max-h-[calc(100dvh-2rem)] rounded-[28px] overflow-hidden bg-white flex flex-col shadow-[0_30px_60px_-15px_rgba(15,23,42,0.45)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
      {/* Branded hero */}
      <div className="relative shrink-0 overflow-hidden px-6 pt-5 pb-9" style={{ background: brandGradient(theme), color: theme.ink }}>
        <div className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between">
          <div className="h-11 px-3 rounded-xl bg-white shadow-md shadow-black/10 flex items-center">
            <img src={logo} alt={logoAlt} className="h-8 max-w-[104px] object-contain" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 ring-1 ring-white/20 text-[10px] font-bold uppercase tracking-wider">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Secure
          </span>
        </div>

        <div className="relative mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold opacity-75">Paying to</p>
            <h3 className="text-base font-extrabold leading-tight truncate">{merchantName}</h3>
            <p className="text-[11px] font-mono opacity-70 truncate">Invoice #{orderId}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-semibold opacity-75">Amount</p>
            <p className="text-[26px] leading-none font-black tracking-tight mt-1">৳{amount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Body sheet overlapping the hero */}
      <div className="relative -mt-4 flex-1 min-h-0 overflow-y-auto rounded-t-[24px] bg-white px-6 pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step {current} of 2</span>
          <span className="text-[11px] font-bold text-slate-700">{stepTitle}</span>
        </div>
        <div className="flex gap-1.5 mb-5">
          {[1, 2].map((s) => (
            <span
              key={s}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: s <= current ? brandGradient(theme) : "#e2e8f0" }}
            />
          ))}
        </div>
        {children}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 bg-white px-6 pt-3 pb-4 border-t border-slate-100">
        <div className="flex gap-3">{footer}</div>
        <p className="mt-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          Secured by CodePay
        </p>
      </div>
    </div>
  );
}

function PrimaryButton({ theme, disabled, onClick, children }: { theme: BrandTheme; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
      style={{ background: brandGradient(theme), color: theme.ink, boxShadow: `0 10px 24px -10px ${theme.from}` }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-600 transition cursor-pointer"
    >
      {children}
    </button>
  );
}

function BackIconButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title="Go Back"
      aria-label="Go Back"
      className="shrink-0 w-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}

function ThemedInput({ theme, icon, className = "", style, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { theme: BrandTheme; icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input
        {...props}
        className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 ${icon ? "pl-11" : "pl-4"} pr-4 font-mono font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-sans placeholder:font-medium transition focus:outline-none focus:bg-white focus:border-[var(--cp-accent)] focus:ring-4 focus:ring-[var(--cp-soft)] disabled:opacity-60 ${className}`}
        style={{ ...style, ["--cp-accent" as string]: theme.accent, ["--cp-soft" as string]: theme.soft }}
      />
    </div>
  );
}

function CopyButton({ theme, copied, onCopy }: { theme?: BrandTheme; copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer
        ${copied ? "bg-emerald-500 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm"}
      `}
      style={!copied && theme ? { color: theme.accent } : undefined}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CopyRow({ label, value, mono, theme, copied = false, onCopy }: { label: string; value: string; mono?: boolean; theme?: BrandTheme; copied?: boolean; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
        <span className={`text-sm font-bold text-slate-900 break-all ${mono ? "font-mono tracking-wide" : ""}`}>{value}</span>
      </div>
      {onCopy && <CopyButton theme={theme} copied={copied} onCopy={onCopy} />}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
    </svg>
  );
}

function CheckoutAlert({ tone, message }: { tone: "error" | "success"; message: string }) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`p-3 rounded-xl text-xs font-semibold text-left flex gap-2 items-start border
        ${isError ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}
      `}
    >
      <svg className="w-4 h-4 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        {isError ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        )}
      </svg>
      <span>{message}</span>
    </div>
  );
}
