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

  const [step, setStep] = useState<1 | 2>(1);
  const [senderNumber, setSenderNumber] = useState("");
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

  const showQr = (displayMode === "both" || displayMode === "qr" || displayMode === "qr_code") && qrCode;
  const showNumber = displayMode !== "qr" && displayMode !== "qr_code";

  return (
    <div className="min-h-screen bg-[#8f9296] flex flex-col items-center justify-center p-4 antialiased font-sans selection:bg-[#e2136e] selection:text-white">
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header White Bar with bKash Logo */}
        <div className="bg-white py-4 flex items-center justify-center border-b-4 border-[#e2136e]">
          <svg width="130" height="55" viewBox="0 0 140 65" fill="none" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>bKash Logo</title>
            <g clipPath="url(#clip0_2750_4283)">
              <path d="M96.7875 31.0528L100.757 48.8874L126.715 35.7465L96.7875 31.0528Z" fill="#CF1E53"></path>
              <path d="M104.17 4.40625L96.7931 31.0583L126.717 35.7483L104.17 4.40625Z" fill="#DD156E"></path>
              <path d="M72.4613 0.500641L103.413 4.20098L96.0947 30.6935L72.4613 0.500641Z" fill="#CF1E53"></path>
              <path d="M72.2139 5.71484H75.6613L85.3346 18.0786L72.2139 5.71484Z" fill="#9E1C3E"></path>
              <path d="M127.543 35.5723L118.544 23.1242L133.094 20.518L127.543 35.5723Z" fill="#CF1E53"></path>
              <path d="M126.033 39.2287L126.96 36.4521L104.25 47.9747L126.033 39.2287Z" fill="#DD156E"></path>
              <path d="M96.1515 31.7584L100.889 53.0642L86.8228 64.5006L96.1515 31.7584Z" fill="#9E1C3E"></path>
              <path d="M131.676 26.8466L139.936 26.7091L133.967 20.6317L131.676 26.8466Z" fill="#DD156E"></path>
              <path d="M2.75592 25.6223H21.265V28.3256H2.52316V49.9632C2.52316 49.9632 1.71491 49.8404 1.22007 49.8404C0.75638 49.8404 0.0690952 49.9632 0.0690952 49.9632L0.0727607 28.3256V25.6223L0.0654297 25.5361C0.0690952 19.1948 2.46635 15.5934 8.59876 15.1554C14.1245 14.7614 18.2867 17.9998 21.2686 19.5778V22.7284L20.8691 22.7925C20.3376 21.5939 13.8185 16.1158 9.56646 16.5355C5.19533 16.9698 2.49567 20.0745 2.54332 24.1396C2.54332 24.1396 2.57448 25.2356 2.72843 25.5636L2.75959 25.6223H2.75592Z" fill="#DD156E"></path>
              <path d="M40.8425 30.0758C45.4483 29.9439 47.8015 31.5659 47.9463 35.0261C48.0251 36.9688 47.2022 38.7704 45.9248 40.3906L43.6393 40.4548L43.6247 40.0919C44.5136 39.8371 46.3756 38.4974 46.2767 36.0946C46.174 33.6241 44.3853 31.7217 41.3685 31.806C41.3685 31.806 40.9159 31.8096 40.6959 31.9031L40.8425 30.0777V30.0758Z" fill="#211E1F"></path>
              <path d="M18.8091 27.7648H21.265V49.9668L18.8091 49.1439V27.7648Z" fill="#DD156E"></path>
              <path d="M66.0393 30.8878C65.0807 27.5742 62.2583 25.6259 60.2258 25.6259H54.8044V28.3274H58.3417C59.8995 28.3274 61.538 28.1625 62.9896 29.4949C63.6127 30.0667 63.8619 30.7064 64.0434 31.5403C64.4942 33.6296 63.5724 36.146 61.1421 36.2083C60.4145 36.2266 59.555 36.157 58.8567 35.9426L58.6661 36.1332C59.2544 36.9121 59.6997 37.7845 60.1671 38.6312C61.5747 38.3765 63.0354 37.5187 64.0067 36.5474C65.5737 34.9785 66.3142 33.0981 66.0374 30.8896" fill="#211E1F"></path>
              <path d="M70.0237 25.9431C68.4805 26.1593 65.9549 27.5742 65.0935 30.8879C64.8443 33.0982 65.5114 34.9767 66.9226 36.5456C67.7968 37.5169 69.1128 38.3765 70.3774 38.6294C70.7971 37.7827 71.1985 36.9121 71.73 36.1314L71.5577 35.9426C70.929 36.157 70.1574 36.2267 69.5013 36.2065C66.9831 36.1369 66.5231 33.5509 66.9171 31.5403C67.2507 29.823 68.7755 28.1332 70.2857 28.0104C71.9627 27.8711 74.0136 29.2842 74.4259 31.018C74.6459 31.9435 74.7284 32.957 74.7284 33.9082V49.9614C74.7284 49.9614 75.4908 49.8459 75.9306 49.8459C76.4017 49.8459 77.1531 49.9614 77.1531 49.9614V25.6682H74.5414V28.3678C74.5414 28.2982 74.6807 28.19 74.5579 27.9921C73.7277 26.6487 71.3432 25.7598 70.0255 25.9467" fill="#211E1F"></path>
              <path d="M54.1776 25.6223V49.9632C54.1776 49.9632 53.3914 49.8404 52.9295 49.8404C52.4328 49.8404 51.7272 49.9632 51.7272 49.9632V28.3275H21.9082V25.6242H54.1776V25.6223Z" fill="#211E1F"></path>
              <path d="M21.265 49.9668H20.8453C11.3772 49.9668 5.98523 44.7288 5.98523 39.5073C5.98523 35.149 9.99531 30.0612 19.2691 30.0612L20.9094 31.3332C14.4672 31.3735 9.1834 35.422 9.1834 39.6649C9.1834 43.3157 13.8313 49.1659 21.2631 49.1659V49.9668H21.265Z" fill="#DD156E"></path>
              <path d="M38.6615 27.7648H41.1174V49.9668L38.6615 49.1439V27.7648Z" fill="#211E1F"></path>
              <path d="M41.1174 49.9668H40.6977C31.2296 49.9668 25.8358 44.7288 25.8358 39.5073C25.8358 35.149 29.8477 30.0612 39.1197 30.0612L40.7618 31.3332C34.3178 31.3735 29.0358 35.422 29.0358 39.6649C29.0358 43.3157 33.6855 49.1659 41.1174 49.1659V49.9668Z" fill="#211E1F"></path>
            </g>
            <defs>
              <clipPath id="clip0_2750_4283">
                <rect width="139.873" height="64" fill="white" transform="translate(0.0637207 0.5)"></rect>
              </clipPath>
            </defs>
          </svg>
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

        {/* bKash Official Red/Pink Content Area with poly style background gradient */}
        <form 
          onSubmit={handleVerify} 
          className="bg-[#e2136e] bg-gradient-to-br from-[#e2136e] via-[#d12053] to-[#b00e54] text-white p-5 flex-1 flex flex-col justify-between min-h-[330px]"
        >
          {step === 1 ? (
            /* STEP 1: QR CODE & INSTRUCTIONS */
            <div className="space-y-4 flex-1">
              
              {/* QR Code */}
              {showQr && (
                <div className="flex flex-col items-center justify-center p-3 bg-white/10 rounded-xl border border-white/20">
                  <span className="block text-[0.6rem] font-bold text-pink-200 uppercase tracking-widest mb-2">
                    scan qr code to pay
                  </span>
                  <div className="bg-white p-2 rounded-xl shadow-inner">
                    <img
                      src={qrCode}
                      alt="bKash QR Code"
                      className="w-[250px] h-[250px] object-contain rounded-md"
                      style={{ width: '250px', height: '250px' }}
                    />
                  </div>
                </div>
              )}

              {/* Instructions steps */}
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <h3 className="text-[0.7rem] font-extrabold text-pink-200 uppercase tracking-wider mb-2 text-center">
                  টাকা পাঠানোর নিয়মাবলি (Steps)
                </h3>
                <ol className="text-xs text-pink-50 space-y-1.5 list-decimal list-inside font-medium leading-relaxed text-left">
                  <li>যেকোনো bKash অ্যাপ অথবা <code className="bg-black/20 text-white px-1 py-0.5 rounded font-mono">*247#</code> ডায়াল করুন।</li>
                  <li>নিচের নম্বরে <span className="underline decoration-pink-300 font-bold">Send Money</span> করুন।</li>
                  <li>টাকা পাঠানোর পর, নিচের <span className="font-bold">Verify</span> বাটনে ক্লিক করুন।</li>
                </ol>
              </div>

              {/* Target bKash Number */}
              {showNumber && (
                <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-xl">
                  <div className="text-left">
                    <span className="block text-[0.55rem] font-bold text-pink-200 uppercase tracking-wider mb-0.5">Send Money To (bKash Personal)</span>
                    <span className="text-base font-extrabold text-white tracking-widest font-mono">{configuredNumber}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-bold transition-all border cursor-pointer ${
                      isCopied 
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" 
                        : "bg-white text-[#e2136e] hover:bg-pink-50 border-white shadow-sm"
                    }`}
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* STEP 2: SENDER PHONE NUMBER INPUT */
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
                  আপনার বিকাশ অ্যাকাউন্ট নম্বর দিন (Your bKash Number)
                </label>
                <input
                  type="text"
                  required
                  disabled={msgType === "success" || isTimeOut}
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-4 py-3 rounded-lg border-none bg-white text-gray-800 placeholder-gray-300 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-pink-300 transition font-mono tracking-widest"
                />
              </div>

              {msg && (
                <div className={`p-4 rounded-xl text-xs font-bold border transition-all duration-300 text-center ${
                  msgType === "success" 
                    ? "bg-emerald-500/25 text-emerald-100 border-emerald-500/30"
                    : msgType === "error"
                    ? "bg-rose-500/25 text-rose-100 border-rose-500/30"
                    : "bg-blue-500/25 text-blue-100 border-blue-500/30"
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
                      window.location.href = callbackUrl;
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
                  className="w-1/2 py-2 bg-[#e2136e] hover:bg-[#b00e54] text-white text-xs font-bold rounded cursor-pointer transition border-none uppercase tracking-wider"
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
                  className="w-1/2 py-2 bg-[#e2136e] hover:bg-[#b00e54] text-white text-xs font-bold rounded cursor-pointer transition border-none uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isVerifying ? "Verifying..." : "Confirm"}
                </button>
              </>
            )}
          </div>

        </form>

        {/* Footer info (matches bKash style) */}
        <div className="bg-white py-4 text-center border-t border-gray-100 flex flex-col items-center justify-center gap-1">
          <p className="text-[0.55rem] text-gray-400 font-medium">
            Powered by CodeBlend Automations | © {new Date().getFullYear()} bKash
          </p>
        </div>

      </div>
    </div>
  );
}
