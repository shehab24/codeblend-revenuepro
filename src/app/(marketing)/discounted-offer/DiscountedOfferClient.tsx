"use client";

import React, { useState, useEffect } from "react";
import { submitDiscountedOfferRequest } from "@/actions/leadActions";

type DiscountedOfferClientProps = {
  bkashNumber: string;
  bkashType: string;
  timerHours?: string;
};

export default function DiscountedOfferClient({ 
  bkashNumber, 
  bkashType,
  timerHours = "62"
}: DiscountedOfferClientProps) {
  // Parse and calculate initial timer fields
  const parsedHours = parseInt(timerHours) || 62;
  const initialDays = Math.floor(parsedHours / 24);
  const initialHours = parsedHours % 24;

  const [timeLeft, setTimeLeft] = useState({
    days: initialDays,
    hours: initialHours,
    minutes: 0,
    seconds: 0,
  });

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    websiteUrl: "",
    senderNumber: "",
    transactionId: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentTab, setPaymentTab] = useState<"number" | "qr">("number");

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          // Reset to create infinite urgency using admin setting
          return { days: initialDays, hours: initialHours, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialDays, initialHours]);

  const scrollToForm = () => {
    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });

      const res = await submitDiscountedOfferRequest(data);
      if (res.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          websiteUrl: "",
          senderNumber: "",
          transactionId: "",
        });
      } else {
        setError(res.error || "আবেদন জমা দিতে সমস্যা হয়েছে।");
      }
    } catch (err: any) {
      setError("সার্ভার এরর, পুনরায় চেষ্টা করুন।");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 text-center text-xs sm:text-sm font-bold shadow-md relative z-10">
        <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping mr-2"></span>
        আজকের স্পেশাল লিমিটেড লাইফটাইম ডিল — অফারটি শেষ হওয়ার আগে লুফে নিন!
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* ── HERO HEADER ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            🔥 SPECIAL OFFER
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            লিমিটেড এক্সপ্রেস অফার!
          </h1>
          <p className="text-slate-500 text-sm sm:text-lg md:text-xl font-medium leading-relaxed">
            আপনার ব্যবসার সুরক্ষা ও সেল বৃদ্ধি করুন আজই। সুযোগটি হাতছাড়া করবেন না!
          </p>
        </div>

        {/* ── TICKETING / DISCOUNT BANNER (Inspired by OrderFlowBD) ── */}
        <div className="bg-[#0b5b54] rounded-3xl text-white shadow-2xl overflow-hidden grid md:grid-cols-[1.5fr_1fr] border border-teal-500/20 relative">
          {/* Inner Ticket separator line */}
          <div className="hidden md:block absolute top-0 bottom-0 left-[60%] border-l-2 border-dashed border-teal-300/30"></div>
          <div className="hidden md:block absolute -top-4 left-[60%] -translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full"></div>
          <div className="hidden md:block absolute -bottom-4 left-[60%] -translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full"></div>

          {/* Left Part: Description & Countdown */}
          <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                1 YEAR SPECIAL DEAL
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                রেভিনিউপ্রো ইন্টেলিজেন্স লাইসেন্স (১ বছর)
              </h2>
              <p className="text-teal-100/80 text-xs sm:text-sm md:text-base leading-relaxed">
                প্লাগিনটির ১ বছরের লাইসেন্স ব্যবহারের মাধ্যমে কুরিয়ার রিটার্ন হ্রাস করুন, ফেক অর্ডার ডিটেক্ট করুন এবং ব্যবসার ১০০% রিয়েল টাইম লাভ-ক্ষতি হিসাব করুন একদম সহজে।
              </p>
            </div>

            {/* Countdown timer */}
            <div className="space-y-3">
              <p className="text-teal-200 text-xs sm:text-sm font-semibold">অফার শেষ হওয়ার আগে!</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  <div className="bg-[#08413c] rounded-xl p-3 text-center min-w-[60px] border border-teal-700/50">
                    <span className="block text-xl sm:text-2xl font-black text-amber-400">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">Days</span>
                  </div>
                  <div className="bg-[#08413c] rounded-xl p-3 text-center min-w-[60px] border border-teal-700/50">
                    <span className="block text-xl sm:text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">Hrs</span>
                  </div>
                  <div className="bg-[#08413c] rounded-xl p-3 text-center min-w-[60px] border border-teal-700/50">
                    <span className="block text-xl sm:text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">Min</span>
                  </div>
                  <div className="bg-[#08413c] rounded-xl p-3 text-center min-w-[60px] border border-teal-700/50">
                    <span className="block text-xl sm:text-2xl font-black text-rose-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">Sec</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Part: Pricing & CTA */}
          <div className="p-8 sm:p-12 bg-[#094d47] flex flex-col justify-center items-center text-center space-y-6">
            <div className="space-y-1">
              <span className="text-teal-300/70 text-sm line-through block">৳ ৪,৯৯৯</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">৳ ১,২০০</span>
              <span className="bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider block mt-2 w-max mx-auto shadow-md">
                SAVE 3799 TK
              </span>
            </div>

            <button 
              onClick={scrollToForm}
              className="w-full max-w-[240px] py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-base hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transition duration-300 shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              এখনই কিনুন &rarr;
            </button>

            <div className="flex items-center gap-1.5 text-xs text-teal-300/80 font-medium">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 9.554l7.834-4.654a1 1 0 00-.516-1.803H2.682a1 1 0 00-.516 1.803zm0 2.5v6.5a2 2 0 002 2h11.668a2 2 0 002-2v-6.5l-7.834 4.654a2 2 0 01-2.001 0L2.166 7.4z" clipRule="evenodd" /></svg>
              <span>100% Secure Payment</span>
            </div>
          </div>
        </div>

        {/* ── OUR POWERFUL FEATURES ── */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              রেভিনিউপ্রো কেন আপনার ব্যবসার জন্য সেরা?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              আমাদের প্লাগিনের প্রতিটি ফিচার আপনার ডেলিভারি বাড়াতে এবং অপচয় রুখতে বিশেষভাবে ডিজাইন করা।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🛡️", title: "অটোমেটেড ফ্রড চেকিং ও কুরিয়ার ফ্রড ডিটেকশন", desc: "কাস্টমারের ফোন নাম্বার দিয়ে Steadfast, Pathao, RedX সহ সকল কুরিয়ারের অতীত পার্সেল ডেলিভারি ও ক্যানসেল রেশিও সরাসরি WooCommerce সাইটে দেখতে পাবেন, যা অটোমেটিকভাবে ফেক ও ফ্রড অর্ডার সনাক্ত করবে।" },
              { icon: "💳", title: "বিকাশ পেমেন্ট গেটওয়ে (bKash Gateway)", desc: "কাস্টমার সরাসরি বিকাশ অ্যাকাউন্ট থেকে সম্পূর্ণ নিরাপদে অটোমেটিক পেমেন্ট করতে পারবেন, যা সেলস বাড়াতে সাহায্য করবে।" },
              { icon: "💰", title: "আংশিক পেমেন্ট সিস্টেম (Partial Payment)", desc: "অর্ডার কনফার্মেশনের জন্য কাস্টমার থেকে অগ্রিম বা আংশিক পেমেন্ট (যেমনঃ ডেলিভারি চার্জ) নেওয়ার চমৎকার অটোমেটেড সুবিধা।" },
              { icon: "🛒", title: "কুইক অর্ডার ও চেকআউট এনহান্সমেন্ট", desc: "মাত্র এক ক্লিকে সুপার-ফাস্ট অর্ডার করার জন্য সম্পূর্ণ অপ্টিমাইজড এক পেজের কার্ট ও আকর্ষণীয় চেকআউট ফর্ম।" },
              { icon: "💬", title: "অটোমেটেড কাস্টমার এসএমএস (SMS)", desc: "অর্ডার কনফার্মেশন, শিপিং ও রিটার্ন অ্যালার্ট কাস্টমারকে স্বয়ংক্রিয়ভাবে পাঠিয়ে পার্সেল রিসিভ করার হার বৃদ্ধি করুন।" },
              { icon: "⚡", title: "এক ক্লিকে কুরিয়ার অটোমেশন", desc: "ম্যানুয়ালি ডাটা এন্ট্রির ঝামেলা শেষ। এক ক্লিকেই হাজার হাজার অর্ডার সরাসরি কুরিয়ার পোর্টালে বুকিং করুন।" },
              { icon: "🎯", title: "পিক্সেল ও কনভার্সন এপিআই (Pixel & CAPI)", desc: "ব্রাউজার পিক্সেল এবং সার্ভার-সাইড Conversions API (CAPI) এর মাধ্যমে আপনার সব সেলস ইভেন্ট ১০০% নির্ভুল ট্র্যাকিং।" },
              { icon: "🔗", title: "ইউটিএম ট্র্যাকিং (UTM Tracking)", desc: "কাস্টমার কোন বিজ্ঞাপন বা সোর্স থেকে এসে অর্ডার করেছে তা UTM প্যারামিটার দিয়ে সহজেই ট্র্যাক করার সুবিধা।" },
              { icon: "🔌", title: "সহজ ওয়ার্ডপ্রেস প্লাগইন সেটআপ", desc: "যেকোনো WooCommerce সাইটের সাথে মাত্র ২ মিনিটে প্লাগইনটি ইন্টিগ্রেট করুন। কোনো কোডিং অভিজ্ঞতার প্রয়োজন নেই।" },
              { icon: "📊", title: "১০০% নির্ভুল লাভ-ক্ষতি হিসাব", desc: "বিজ্ঞাপন খরচ, কুরিয়ার চার্জ এবং রিটার্ন ড্যামেজ হিসাব করে প্রতিটি প্রোডাক্টের আসল প্রফিট রিয়েল টাইমে মনিটর করুন।" },
              { icon: "🚫", title: "ডুপ্লিকেট ও ফেক অর্ডার ফিল্টারিং", desc: "একই কাস্টমারের ডুপ্লিকেট অর্ডার, ওটিপি ভেরিফিকেশন এবং ভুয়া অর্ডার সিস্টেম অটোমেটিক ফিল্টার করে বাদ দিয়ে দেয়।" },
              { icon: "📉", title: "অ্যাবানডনড কার্ট রিকভারি", desc: "অর্ডার সম্পূর্ণ না করে কার্ট ছেড়ে চলে যাওয়া কাস্টমারদের ট্র্যাক করে অফার বা রিমাইন্ডার পাঠানোর অটোমেটেড সিস্টেম।" }
            ].map((feat) => (
              <div key={feat.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {feat.icon}
                </div>
                <h3 className="font-extrabold text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed flex-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── REFUND GUARANTEE SECTION (Inspired by OrderFlowBD) ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 flex flex-col md:flex-row gap-8 sm:gap-12 items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500"></div>

          {/* Guarantee Seal */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-44 h-44 rounded-full border-4 border-dashed border-emerald-300/60 p-2 flex items-center justify-center bg-slate-50/50">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex flex-col items-center justify-center text-center text-white p-4 shadow-lg">
                <span className="text-3xl font-black">100%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest mt-0.5">Money Back</span>
                <span className="text-[11px] font-black tracking-wider border-t border-white/40 pt-1 mt-1 uppercase">Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Guarantee Content */}
          <div className="space-y-6 flex-1 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              সন্তুষ্ট না হলে পুরো টাকা ফেরত!
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              আমাদের প্লাগিনে আমরা এতটাই কনফিডেন্ট যে দিচ্ছি <span className="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded">৭ দিনের</span> মধ্যে যদি উল্লেখিত ফিচারগুলো কাজ না করে আমরা সম্পূর্ণ টাকা ফেরত দেব নো-কোয়েশ্চেন মানি-ব্যাক গ্যারান্টি।
            </p>
            <p className="text-xs text-slate-400 font-medium">কোনো ঝুঁকি ছাড়াই আজই ব্যবহার শুরু করুন।</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button 
                onClick={scrollToForm}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                🛒 অফারটি নিন
              </button>
              <div className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Secured by PipraPay
              </div>
            </div>
          </div>
        </div>

        {/* ── PAYMENT INSTRUCTIONS & APPLICATION FORM ── */}
        <div id="apply-form" className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">
          
          {/* Left Column: Payment Details */}
          <div className="bg-[#0b5b54] rounded-3xl text-white p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xl border border-teal-500/20">
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight border-b border-teal-700/50 pb-4">
                বিকাশ পেমেন্ট গাইডলাইন
              </h3>
              
              <div className="space-y-4">
                <p className="text-teal-100/90 text-sm leading-relaxed">
                  প্লাগিনটি অ্যাক্টিভ করতে নিচের বিকাশ নাম্বারে অথবা QR কোড স্ক্যান করে <span className="text-amber-300 font-extrabold">৳১,২০০ BDT</span> সেন্ডমানি (Send Money) করুন।
                </p>

                {/* Tab switcher */}
                <div className="flex bg-[#08413c] p-1 rounded-xl border border-teal-700/50">
                  <button
                    type="button"
                    onClick={() => setPaymentTab("number")}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      paymentTab === "number"
                        ? "bg-[#0b5b54] text-white shadow-md"
                        : "text-teal-300 hover:text-white"
                    }`}
                  >
                    বিকাশ নম্বর
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("qr")}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      paymentTab === "qr"
                        ? "bg-[#0b5b54] text-white shadow-md"
                        : "text-teal-300 hover:text-white"
                    }`}
                  >
                    QR কোড স্ক্যান
                  </button>
                </div>

                {paymentTab === "number" ? (
                  /* Displaying bKash Payment details */
                  <div className="bg-[#08413c] rounded-2xl p-6 border border-teal-700/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-teal-300 uppercase tracking-widest font-bold">বিকাশ নাম্বার</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                        {bkashType || "Personal"}
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-wider font-mono">
                      {bkashNumber || "01977757486"}
                    </div>
                    <p className="text-xs text-teal-200/70 leading-relaxed pt-2 border-t border-teal-800/40">
                      * পেমেন্ট করার সময় রেফারেন্সে আপনার ফোন নাম্বার অথবা সাইটের নাম ব্যবহার করতে পারেন।
                    </p>
                  </div>
                ) : (
                  /* QR Code Card */
                  <div className="flex flex-col items-center justify-center py-2">
                    <img 
                      src="/bkash-qr.png" 
                      alt="bKash QR Code" 
                      className="w-full max-w-[320px] h-auto object-contain rounded-2xl shadow-xl border border-teal-700/30"
                    />
                  </div>
                )}
              </div>

              {/* Instructions steps - only shown for Number payment */}
              {paymentTab === "number" && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-teal-300 uppercase tracking-widest">ধাপসমূহ:</h4>
                  <div className="space-y-3">
                    {[
                      `নির্ধারিত বিকাশ নম্বরে (${bkashNumber || "01977757486"}) ১,২০০ টাকা সেন্ডমানি সম্পন্ন করুন।`,
                      "লেনদেন শেষে বিকাশ ফিরতি এসএমএস থেকে Transaction ID (TrxID) টি সংরক্ষণ করুন।",
                      "ডানের ফরমে আপনার প্রয়োজনীয় তথ্যের সাথে Transaction ID এবং আপনার বিকাশ নম্বরটি দিয়ে সাবমিট করুন।"
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-xs sm:text-sm text-teal-100/90 animate-fadeIn">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#08413c] flex items-center justify-center font-bold text-amber-400 text-xs border border-teal-700/50">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              পেমেন্ট ভেরিফিকেশন ও লাইসেন্স ফরম
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              পেমেন্ট সম্পন্ন করার পর নিচের ফরমটি সতর্কতার সাথে পূরণ করে সাবমিট করুন। আমাদের টিম দ্রুত তথ্য যাচাই করে আপনার লাইসেন্স কি পাঠিয়ে দেবে।
            </p>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
                  ✓
                </div>
                <h4 className="text-xl font-bold text-slate-800">পেমেন্ট ভেরিফিকেশন আবেদন সফল হয়েছে!</h4>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  আপনার আবেদনটি সফলভাবে সিস্টেমে জমা হয়েছে। আমাদের অ্যাডমিন প্যানেল আপনার TrxID টি চেক করে ১৫-৩০ মিনিটের মধ্যে লাইসেন্স কি চালু করে দেবে এবং আপনাকে ইমেইলের মাধ্যমে জানানো হবে।
                </p>
                <div className="pt-4">
                  <a 
                    href="/dashboard"
                    className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                  >
                    ড্যাশবোর্ডে যান
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl font-medium">
                    ⚠️ {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">আপনার নাম *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Shehab Uddin"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">আপনার ইমেইল *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. user@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">মোবাইল নম্বর *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 01700000000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">ওয়েবসাইট ডোমেইন (URL) *</label>
                    <input 
                      type="text" 
                      name="websiteUrl" 
                      required
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      placeholder="e.g. mystorebd.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">বিকাশ সেন্ডার নম্বর *</label>
                    <input 
                      type="text" 
                      name="senderNumber" 
                      required
                      value={formData.senderNumber}
                      onChange={handleInputChange}
                      placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">বিকাশ Transaction ID (TrxID) *</label>
                    <input 
                      type="text" 
                      name="transactionId" 
                      required
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="e.g. 8K3J9S8F2L"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm text-slate-900 bg-slate-50/50 font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-md disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider mt-4"
                >
                  {isPending ? "রিকোয়েস্ট পাঠানো হচ্ছে..." : "পেমেন্ট ডিটেইলস সাবমিট করুন"}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
