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
  const merchantId = searchParams.get("merchant_id") || "";
  const displayMode = searchParams.get("display_mode") || "both";

  // Selected Method (bkash, nagad, rocket)
  const [selectedMethod, setSelectedMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");

  // Numbers & QRs configuration
  const bkashNumber = searchParams.get("bkash_number") || searchParams.get("number") || "01784450219";
  const bkashQr = searchParams.get("bkash_qr") || searchParams.get("qr_code") || "";

  const nagadNumber = searchParams.get("nagad_number") || searchParams.get("number") || "01784450219";
  const nagadQr = searchParams.get("nagad_qr") || "";

  const rocketNumber = searchParams.get("rocket_number") || searchParams.get("number") || "01784450219";
  const rocketQr = searchParams.get("rocket_qr") || "";

  // Active configurations based on selection
  const currentNumber = selectedMethod === "bkash" 
    ? bkashNumber 
    : selectedMethod === "nagad" 
      ? nagadNumber 
      : rocketNumber;

  const currentQr = selectedMethod === "bkash" 
    ? bkashQr 
    : selectedMethod === "nagad" 
      ? nagadQr 
      : rocketQr;

  const activeColor = selectedMethod === "bkash" 
    ? "#e2136e" 
    : selectedMethod === "nagad" 
      ? "#f05a24" 
      : "#8c3494";

  const activeGradient = selectedMethod === "bkash" 
    ? "from-[#e2136e] via-[#d12053] to-[#b00e54]" 
    : selectedMethod === "nagad" 
      ? "from-[#f05a24] via-[#df4a13] to-[#bf3a03]" 
      : "from-[#8c3494] via-[#7b2383] to-[#5a0262]";

  const dialCode = selectedMethod === "bkash" 
    ? "*247#" 
    : selectedMethod === "nagad" 
      ? "*167#" 
      : "*322#";

  const brandName = selectedMethod === "bkash" 
    ? "bKash" 
    : selectedMethod === "nagad" 
      ? "Nagad" 
      : "Rocket";

  const [step, setStep] = useState<1 | 2>(1);
  const [trxIdInput, setTrxIdInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "info" | "">("");
  const [isCopied, setIsCopied] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [isTimeOut, setIsTimeOut] = useState(false);

  const amount = parseFloat(amountParam) || 0;

  // Track transition to step 2 to start/reset the 15-min countdown
  useEffect(() => {
    if (step === 2) {
      setTimerSeconds(15 * 60);
      setIsTimeOut(false);
      if (msgType === "error" && msg.includes("সময় শেষ")) {
        setMsg("");
        setMsgType("");
      }
    }
  }, [step]);

  // Countdown logic
  useEffect(() => {
    if (step !== 2 || isTimeOut || msgType === "success") return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeOut(true);
          setMsg("ভেরিফিকেশন সময় শেষ হয়ে গেছে! অনুগ্রহ করে আবার চেষ্টা করুন। (Verification timeout! Please go back and try again.)");
          setMsgType("error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, isTimeOut, msgType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle number copy
  const handleCopy = () => {
    navigator.clipboard.writeText(currentNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Perform payment verification check
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrx = trxIdInput.trim().toUpperCase();

    if (!merchantId) {
      setMsg("ত্রুটি: মার্চেন্ট আইডি পাওয়া যায়নি (Error: Merchant ID is missing)");
      setMsgType("error");
      return;
    }

    if (!cleanTrx || cleanTrx.length < 6) {
      setMsg("একটি সঠিক ট্রানজেকশন আইডি দিন (Enter a valid Transaction ID)");
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
          trxId: cleanTrx,
          amount: amount,
          merchantId: merchantId,
          orderId: orderId !== "N/A" ? orderId : undefined,
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

  const showQr = (displayMode === "both" || displayMode === "qr" || displayMode === "qr_code") && currentQr;
  const showNumber = displayMode !== "qr" && displayMode !== "qr_code";

  return (
    <div className="min-h-screen bg-[#8f9296] flex flex-col items-center justify-center p-4 antialiased font-sans selection:bg-[#e2136e] selection:text-white">
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Method Selection Tabs */}
        <div className="flex border-b border-gray-150 bg-slate-50">
          <button
            onClick={() => { setSelectedMethod("bkash"); setStep(1); setMsg(""); }}
            className={`flex-1 py-3 text-xs font-black text-center transition-all uppercase tracking-wider ${
              selectedMethod === "bkash"
                ? "text-[#e2136e] border-b-2 border-[#e2136e] bg-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            bKash
          </button>
          <button
            onClick={() => { setSelectedMethod("nagad"); setStep(1); setMsg(""); }}
            className={`flex-1 py-3 text-xs font-black text-center transition-all uppercase tracking-wider ${
              selectedMethod === "nagad"
                ? "text-[#f05a24] border-b-2 border-[#f05a24] bg-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Nagad
          </button>
          <button
            onClick={() => { setSelectedMethod("rocket"); setStep(1); setMsg(""); }}
            className={`flex-1 py-3 text-xs font-black text-center transition-all uppercase tracking-wider ${
              selectedMethod === "rocket"
                ? "text-[#8c3494] border-b-2 border-[#8c3494] bg-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Rocket
          </button>
        </div>

        {/* Dynamic Brand Logo & Info Header */}
        <div className="bg-white py-4 flex items-center justify-center border-b-4" style={{ borderColor: activeColor }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-black uppercase tracking-widest text-slate-800" style={{ color: activeColor }}>
              {brandName} Payment
            </span>
          </div>
        </div>

        {/* Invoice & Merchant Info Bar with Bangladesh Flag Avatar */}
        <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-150">
          <div className="flex items-center gap-3">
            {/* Green and red circular avatar (flag style) */}
            <div className="w-10 h-10 bg-[#006a4e] rounded-full flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 bg-[#f42a41] rounded-full"></div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm text-gray-800 font-extrabold leading-tight">{merchantName}</span>
              <span className="text-[0.65rem] text-gray-400 font-semibold mt-0.5">Invoice: {orderId}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg text-gray-800 font-black tracking-tight">৳{amount.toLocaleString("bn-BD")}</span>
          </div>
        </div>

        {/* Brand-Specific Gradient Content Area */}
        <form 
          onSubmit={handleVerify} 
          className={`bg-gradient-to-br ${activeGradient} text-white p-5 flex-1 flex flex-col justify-between min-h-[330px]`}
        >
          {step === 1 ? (
            /* STEP 1: QR CODE & INSTRUCTIONS */
            <div className="space-y-4 flex-1">
              
              {/* QR Code */}
              {showQr && (
                <div className="flex flex-col items-center justify-center p-3 bg-white/10 rounded-xl border border-white/20">
                  <span className="block text-[0.6rem] font-bold text-pink-100 uppercase tracking-widest mb-2">
                    scan qr code to pay
                  </span>
                  <div className="bg-white p-2 rounded-xl shadow-inner">
                    <img
                      src={currentQr}
                      alt={`${brandName} QR Code`}
                      className="w-[250px] h-[250px] object-contain rounded-md"
                      style={{ width: '250px', height: '250px' }}
                    />
                  </div>
                </div>
              )}

              {/* Instructions steps */}
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <h3 className="text-[0.7rem] font-extrabold text-pink-100 uppercase tracking-wider mb-2 text-center">
                  টাকা পাঠানোর নিয়মাবলি (Steps)
                </h3>
                <ol className="text-xs text-pink-50 space-y-1.5 list-decimal list-inside font-medium leading-relaxed text-left font-semibold">
                  <li>যেকোনো {brandName} অ্যাপ অথবা <code className="bg-black/20 text-white px-1 py-0.5 rounded font-mono">{dialCode}</code> ডায়াল করুন।</li>
                  <li>নিচের নম্বরে <span className="underline decoration-pink-300 font-bold">Send Money</span> করুন।</li>
                  <li>টাকা পাঠানোর পর, নিচের <span className="font-bold">Verify</span> বাটনে ক্লিক করুন।</li>
                </ol>
              </div>

              {/* Target Number */}
              {showNumber && (
                <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-xl">
                  <div className="text-left">
                    <span className="block text-[0.55rem] font-bold text-pink-200 uppercase tracking-wider mb-0.5">Send Money To ({brandName} Personal)</span>
                    <span className="text-base font-extrabold text-white tracking-widest font-mono">{currentNumber}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold transition-all border cursor-pointer bg-white text-slate-800 hover:bg-slate-100 border-white shadow-sm"
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* STEP 2: TRANSACTION ID INPUT */
            <div className="flex-1 flex flex-col justify-center space-y-5 py-4">
              {/* Countdown Timer */}
              <div className="text-center bg-black/20 py-2 px-3 rounded-lg border border-white/10 flex items-center justify-center gap-2">
                <span className="text-[11px] font-medium text-pink-200">⌛ ভেরিফিকেশন করার বাকি সময়:</span>
                <span className="text-xs font-black text-white font-mono bg-white/15 px-2 py-0.5 rounded tracking-widest animate-pulse">
                  {formatTime(timerSeconds)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-100 uppercase tracking-widest text-center mb-3">
                  আপনার ট্রানজেকশন আইডি দিন (Your Transaction ID)
                </label>
                <input
                  type="text"
                  required
                  disabled={msgType === "success" || isTimeOut}
                  value={trxIdInput}
                  onChange={(e) => setTrxIdInput(e.target.value)}
                  placeholder="যেমন: 8N34KJL98S"
                  className="w-full px-4 py-3 rounded-lg border-none bg-white text-gray-800 placeholder-gray-300 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-pink-300 transition font-mono tracking-widest"
                />
              </div>

              {msg && (
                <div className={`p-4 rounded-xl text-xs font-extrabold border transition-all duration-300 text-center shadow-lg leading-relaxed ${
                  msgType === "success" 
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : msgType === "error"
                    ? "bg-white text-rose-700 border-rose-200"
                    : "bg-blue-600 text-white border-blue-700"
                }`}>
                  {msg}
                  {msgType === "success" && callbackUrl && (
                    <span className="block mt-2 text-pink-200 font-semibold animate-pulse">
                      Redirecting back to site in {countdown}s...
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="mt-6 -mx-5 -mb-5 bg-[#e6e6e6] p-3.5 flex justify-between gap-3 border-t border-gray-300">
            {step === 1 ? (
              <>
                <button
                  onClick={() => {
                    if (callbackUrl) {
                      const redirectTarget = new URL(callbackUrl);
                      redirectTarget.searchParams.set("status", "pending");
                      window.location.href = redirectTarget.toString();
                    }
                  }}
                  type="button"
                  className="w-1/2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded cursor-pointer transition border border-gray-400/50 uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded cursor-pointer transition border-none uppercase tracking-wider"
                  style={{ backgroundColor: activeColor }}
                >
                  Verify
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  type="button"
                  disabled={isVerifying || msgType === "success"}
                  className="w-1/2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded cursor-pointer transition border border-gray-400/50 uppercase tracking-wider disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || msgType === "success" || isTimeOut}
                  className="w-1/2 py-2 text-white text-xs font-bold rounded cursor-pointer transition border-none uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeColor }}
                >
                  {isVerifying ? "Verifying..." : "Confirm"}
                </button>
              </>
            )}
          </div>

        </form>

        {/* Footer info */}
        <div className="bg-white py-4 text-center border-t border-gray-100 flex flex-col items-center justify-center gap-1">
          <p className="text-[0.55rem] text-gray-400 font-medium">
            Powered by CodeBlend Automations | © {new Date().getFullYear()} {brandName}
          </p>
        </div>

      </div>
    </div>
  );
}
