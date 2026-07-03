"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function PayClient() {
  const searchParams = useSearchParams();

  // Query Params
  const amountParam = searchParams.get("amount") || "";
  const orderId = searchParams.get("order_id") || "N/A";
  const callbackUrl = searchParams.get("callback") || "";
  const merchantName = searchParams.get("merchant") || "CodeBlend Store";
  const configuredNumber = searchParams.get("number") || "01784450219";
  const merchantId = searchParams.get("merchant_id") || "";
  const qrCode = searchParams.get("qr_code") || "";
  const displayMode = searchParams.get("display_mode") || "both";

  const [senderNumber, setSenderNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "info" | "">("");
  const [isCopied, setIsCopied] = useState(false);
  const [countdown, setCountdown] = useState(4);

  const amount = parseFloat(amountParam) || 0;

  // Handle number copy
  const handleCopy = () => {
    navigator.clipboard.writeText(configuredNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Perform payment verification check
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = senderNumber.trim().replace(/[^0-9]/g, "");

    if (!merchantId) {
      setMsg("ত্রুটি: মার্চেন্ট আইডি পাওয়া যায়নি (Error: Merchant ID is missing)");
      setMsgType("error");
      return;
    }

    if (!cleanNumber || cleanNumber.length < 11) {
      setMsg("একটি সঠিক ১১ ডিজিটের bKash নম্বর দিন (Enter a valid 11-digit number)");
      setMsgType("error");
      return;
    }

    if (amount <= 0) {
      setMsg("পেমেন্ট এর পরিমাণ সঠিক নয় (Invalid payment amount)");
      setMsgType("error");
      return;
    }

    setIsVerifying(true);
    setMsg("পেমেন্ট যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন... (Verifying...)");
    setMsgType("info");

    try {
      const response = await fetch("/api/v1/payments/bkash-manual/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderNumber: cleanNumber,
          amount: amount,
          merchantId: merchantId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMsg(`✅ পেমেন্ট সফলভাবে সম্পন্ন হয়েছে! TrxID: ${data.trxId}`);
        setMsgType("success");

        // Redirect customer after 3 seconds
        if (callbackUrl) {
          const redirectTarget = new URL(callbackUrl);
          redirectTarget.searchParams.set("trx_id", data.trxId);
          redirectTarget.searchParams.set("status", "success");

          let timer = 3;
          const interval = setInterval(() => {
            timer--;
            setCountdown(timer);
            if (timer <= 0) {
              clearInterval(interval);
              window.location.href = redirectTarget.toString();
            }
          }, 1000);
        }
      } else {
        setMsg(data.error || "পেমেন্ট পাওয়া যায়নি। টাকা পাঠিয়ে থাকলে ২ মিনিট পর আবার চেষ্টা করুন।");
        setMsgType("error");
      }
    } catch (error) {
      setMsg("সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন। (Server error, try again.)");
      setMsgType("error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 antialiased selection:bg-pink-500 selection:text-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Header Pink Bar */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-center text-white relative">
          <h2 className="text-xl font-bold tracking-tight">bKash Payment</h2>
          <p className="text-xs text-pink-100/80 mt-1 font-medium">নিরাপদ ও সহজ অটোমেটেড পেমেন্ট গেটওয়ে</p>
        </div>

        {/* Invoice Summary */}
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/50">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-2">
            <span>MERCHANT: {merchantName}</span>
            <span>ORDER: #{orderId}</span>
          </div>
          <div className="flex justify-between items-baseline mt-3">
            <span className="text-sm font-semibold text-slate-400">Total Payable:</span>
            <span className="text-3xl font-black text-emerald-400">৳{amount.toLocaleString("bn-BD")}</span>
          </div>
        </div>

        {/* QR & Payment Instructions */}
        <div className="p-6 space-y-5">
          {/* QR Code Display (shown if displayMode is both or qr, and qrCode URL is present) */}
          {(displayMode === "both" || displayMode === "qr") && qrCode && (
            <div className="flex flex-col items-center justify-center p-5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-3">
                scan qr code to pay
              </span>
              <div className="bg-white p-3 rounded-2xl shadow-inner relative overflow-hidden group">
                <img
                  src={qrCode}
                  alt="bKash QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">টাকা পাঠানোর নিয়মাবলি (Steps)</h3>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-medium leading-relaxed">
              <li>যেকোনো bKash অ্যাপ অথবা <code className="bg-slate-800 text-pink-400 px-1 py-0.5 rounded">*247#</code> ডায়াল করুন।</li>
              <li>নিচের নম্বরে <span className="text-pink-500 font-bold">Send Money</span> করুন।</li>
              <li>টাকা পাঠানোর পর, নিচে আপনার bKash নম্বরটি দিয়ে পেমেন্ট কনফার্ম করুন।</li>
            </ol>
          </div>
          {/* Target bKash Number Display (hidden if displayMode is qr) */}
          {displayMode !== "qr" && (
            <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
              <div>
                <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Send Money To (bKash Personal)</span>
                <span className="text-xl font-extrabold text-white tracking-widest font-mono">{configuredNumber}</span>
              </div>
              <button
                onClick={handleCopy}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isCopied 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                আপনার বিকাশ নম্বর দিন (Your Sender Number)
              </label>
              <input
                type="text"
                required
                disabled={msgType === "success"}
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition font-mono tracking-widest"
              />
            </div>

            {msg && (
              <div className={`p-4 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                msgType === "success" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : msgType === "error"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {msg}
                {msgType === "success" && callbackUrl && (
                  <span className="block mt-2 text-slate-400 font-semibold animate-pulse">
                    Redirecting back to site in {countdown}s...
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || msgType === "success"}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-pink-500/10 transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  যাচাই করা হচ্ছে (Verifying...)
                </>
              ) : (
                "পেমেন্ট নিশ্চিত করুন (Confirm Payment)"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/40 text-center">
          <p className="text-[0.65rem] text-slate-500 font-medium">Powered by CodeBlend Automations</p>
        </div>

      </div>
    </div>
  );
}
