"use client";

import React, { useState } from "react";
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
    brandName: string;
    brandLogo: string;
    brandColor: string;
  };
}

const METHOD_CONFIG = {
  bkash:  { label: "bKash",  logo: "/logos/bkash.png",  ring: "ring-pink-400",   bg: "bg-pink-50",   border: "border-pink-400",   text: "text-pink-700"   },
  nagad:  { label: "Nagad",  logo: "/logos/nagad.png",  ring: "ring-orange-400", bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700" },
  rocket: { label: "Rocket", logo: "/logos/rocket.png", ring: "ring-purple-400", bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-700" },
};

export default function CodePayCheckoutClient({ payment, merchant }: CodePayCheckoutClientProps) {
  const [selectedMethod, setSelectedMethod] = useState<"bkash" | "nagad" | "rocket" | null>(
    merchant.bkash ? "bkash" : merchant.nagad ? "nagad" : merchant.rocket ? "rocket" : null
  );
  const [trxId, setTrxId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingMessage, setLoadingMessage] = useState("");

  const displayName = merchant.brandName || merchant.name || "Merchant";
  const headerBg = merchant.brandColor || "#0f172a";

  const getNumber = () => {
    if (selectedMethod === "bkash") return merchant.bkash;
    if (selectedMethod === "nagad") return merchant.nagad;
    if (selectedMethod === "rocket") return merchant.rocket;
    return null;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !trxId.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    setLoadingMessage("Connecting to gateway secure server...");
    
    const updateMessage = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setLoadingMessage(msg);
          resolve();
        }, delay);
      });
    };

    try {
      const label = selectedMethod === "bkash" ? "bKash" : selectedMethod === "nagad" ? "Nagad" : "Rocket";
      await updateMessage(`Verifying transaction with ${label}...`, 1200);
      await updateMessage("Matching with SMS sync database...", 1300);
      await updateMessage("Finalizing verification...", 1000);
      
      const res = await verifyCodePayPayment(payment.id, trxId, selectedMethod);
      if (res.success && res.redirectUrl) {
        setSuccessMessage("Payment verified! Redirecting…");
        setTimeout(() => { window.location.href = res.redirectUrl!; }, 1500);
      } else {
        setErrorMessage(res.message || "Failed to verify payment.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed. Try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

  const number = getNumber();
  const cfg = selectedMethod ? METHOD_CONFIG[selectedMethod] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-10 px-4 bg-slate-100">

      <div className="w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* ── Branded Header ── */}
        <div
          className="relative px-6 pt-8 pb-7 text-center overflow-hidden"
          style={{ backgroundColor: headerBg }}
        >
          {/* subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_70%)]" />

          <div className="relative space-y-3">
            {/* brand badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[9px] font-black tracking-widest uppercase border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CodePay Secured
            </span>

            {/* merchant logo or name */}
            {merchant.brandLogo ? (
              <img
                src={merchant.brandLogo}
                alt={displayName}
                className="h-9 object-contain mx-auto"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{displayName}</p>
            )}

            {/* amount */}
            <div className="text-4xl font-black text-white tracking-tight">
              ৳{payment.amount.toFixed(2)}
            </div>
            <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">
              Pay to {displayName}
            </p>
          </div>
        </div>

        {/* ── Order Info Bar ── */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
          <span>Order <strong className="text-slate-800">#{payment.orderId}</strong></span>
          <span className="text-slate-400">·</span>
          <span className="truncate max-w-[180px]">{payment.customerEmail || "Guest"}</span>
        </div>

        <div className="p-6 space-y-5">

          {step === 1 && (
            <div className="space-y-5">
              {/* ── Method selector ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Select Payment Method</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["bkash", "nagad", "rocket"] as const).map((m) => {
                    const c = METHOD_CONFIG[m];
                    const hasNumber = !!merchant[m];
                    const isActive = selectedMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => hasNumber && setSelectedMethod(m)}
                        disabled={!hasNumber}
                        className={`relative flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border-2 transition-all cursor-pointer h-[76px]
                          ${isActive ? `${c.border} ${c.bg} ring-2 ${c.ring} ring-offset-1` : "border-slate-200 bg-white hover:border-slate-300"}
                          ${!hasNumber ? "opacity-35 cursor-not-allowed" : ""}
                        `}
                      >
                        <img src={c.logo} alt={c.label} className="h-7 object-contain" />
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? c.text : "text-slate-500"}`}>
                          {c.label}
                        </span>
                        {!hasNumber && (
                          <span className="absolute top-1 right-1 text-[7px] font-bold text-slate-300 uppercase">N/A</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {cfg && number ? (
                <div className="space-y-4">
                  {/* Instructions card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Instructions</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[9px] font-extrabold uppercase">Personal</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p><span className="font-black text-slate-400 mr-1">1.</span>Open your <strong>{cfg.label} app</strong> or dial USSD.</p>
                      <p><span className="font-black text-slate-400 mr-1">2.</span>Choose <strong>Send Money</strong>.</p>
                      <p><span className="font-black text-slate-400 mr-1">3.</span>Send exactly <strong>৳{payment.amount.toFixed(2)}</strong> to the number below.</p>
                    </div>

                    {/* Number row */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Send Money To</span>
                        <span className="text-sm font-black text-slate-800 font-mono">{number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(number, "number")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition cursor-pointer"
                      >
                        {copiedField === "number" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {/* Amount row */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Exact Amount</span>
                        <span className="text-sm font-black text-slate-800 font-mono">৳{payment.amount.toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payment.amount.toFixed(2), "amount")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition cursor-pointer"
                      >
                        {copiedField === "amount" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{ backgroundColor: headerBg }}
                    className="w-full py-3.5 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    Verify Payment
                  </button>

                  <div className="pt-2 border-t border-slate-100 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-[10px] font-black text-slate-400 hover:text-slate-600 tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Cancel & Go Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold">
                  {selectedMethod
                    ? `The merchant hasn't configured their ${cfg?.label} number yet. Please select a different method.`
                    : "Please select a payment method above to continue."}
                </div>
              )}
            </div>
          )}

          {step === 2 && cfg && number && (
            <div className="space-y-4">
              {/* Compact transaction summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <img src={cfg.logo} alt={cfg.label} className="h-5 object-contain" />
                  <span className="font-bold text-slate-800">{cfg.label} Send Money</span>
                </div>
                <p>
                  Please enter the 8-10 character Transaction ID (TrxID) after sending exactly <strong className="text-slate-800">৳{payment.amount.toFixed(2)}</strong> to <strong className="text-slate-800">{number}</strong>.
                </p>
              </div>

              {/* ── Feedback messages ── */}
              {errorMessage && (
                <div className="flex items-start gap-2 py-2.5 px-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-[11px] font-medium leading-snug">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* TrxID form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 text-center">
                    Enter Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="e.g. 8N34KJL98S"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-center uppercase tracking-widest focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-center">Found in your operator SMS receipt after sending.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ backgroundColor: headerBg }}
                    className="w-full py-3.5 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying…
                        </div>
                        <span className="text-[9px] font-medium text-white/70 normal-case mt-0.5">{loadingMessage}</span>
                      </>
                    ) : "Verify Payment"}
                  </button>

                  <div className="pt-2 border-t border-slate-100 flex justify-center">
                    <button
                      type="button"
                      onClick={() => !isLoading && setStep(1)}
                      disabled={isLoading}
                      className="text-[10px] font-black text-slate-400 hover:text-slate-600 tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Instructions
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-6">
        Powered by CodePay · CodeBlend
      </p>
    </div>
  );
}
