"use client";

import { useState } from "react";
import Link from "next/link";
import { LeadCTAButton } from "@/components/LeadPopup";

interface PricingSectionProps {
  userId?: string | null;
}

export function PricingSectionWithTabs({ userId }: PricingSectionProps) {
  const [activeTab, setActiveTab] = useState<"revenuepro" | "codepay" | "expense">("revenuepro");

  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-750 uppercase tracking-wider">Simple & Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">সহজ ও স্বচ্ছ প্রাইসিং প্ল্যান</h2>
          <p className="text-slate-550 text-sm sm:text-base max-w-xl mx-auto">আপনার ব্যবসার প্রয়োজন অনুযায়ী যেকোনো প্রোডাক্ট বা বান্ডেল প্ল্যান সিলেক্ট করুন।</p>
        </div>

        {/* Product Selection Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("revenuepro")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "revenuepro"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>🛡️</span> RevenuePro Suite
            </button>
            <button
              onClick={() => setActiveTab("codepay")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "codepay"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>💳</span> CodePay Router
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "expense"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>📊</span> Expense Tracker
            </button>
          </div>
        </div>

        {/* ═══════════ TAB 1: REVENUEPRO PRICING ═══════════ */}
        {activeTab === "revenuepro" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Monthly */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Start Smart</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">Monthly Plan</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ২৪৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/মাস</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">নতুন স্টার্টআপ ও ছোট ই-কমার্স ব্যবসার জন্য সেরা শুরু।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)",
                    "bKash API-এর মতো সহজ পেমент ভেরিফিকেশন",
                    "Partial Payment (আংশিক পেমেন্ট) সুবিধা",
                    "Automated Fraud Detection & ব্লকিং",
                    "পেমেন্ট মেথড অটো সুইচ (Switcher)",
                    "IP, Email & browser ব্লকিং সিস্টেম",
                    "OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন",
                    "কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট",
                    "কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট",
                    "পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং",
                    "COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট",
                    "সন্দেহজনক অর্ডারে Instant Warning Popup",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-650 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                {!userId ? (
                  <LeadCTAButton serviceType="RevenuePro Monthly" className="w-full py-3.5 text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all cursor-pointer text-sm">
                    শুরু করুন
                  </LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full py-3.5 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all text-sm">
                    সাবস্ক্রাইব করুন
                  </Link>
                )}
              </div>
            </div>

            {/* 6 Months Plan - BEST VALUE (Fixed badge clip) */}
            <div className="bg-slate-900 rounded-3xl border-2 border-emerald-500/50 p-8 shadow-xl flex flex-col justify-between relative md:-translate-y-4 hover:scale-[1.01] transition-all duration-300">
              {/* Badge placed above without overflow-hidden clipping */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border border-emerald-400/40 inline-flex items-center gap-1 whitespace-nowrap">
                  ⭐ BEST VALUE
                </span>
              </div>
              
              <div>
                <h3 className="text-emerald-400 font-extrabold text-xl mb-2 mt-2">6 Months Plan</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tight">৳ ১,৪৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/৬ মাস</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">ব্যবসার প্রয়োজনীয় সকল অ্যাডভান্সড অটোমেশন ও সাপোর্ট।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)",
                    "bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন",
                    "Partial Payment (আংশিক পেমেন্ট) সুবিধা",
                    "Automated Fraud Detection & ব্লকিং",
                    "পেমেন্ট মেথড অটো সুইচ (Switcher)",
                    "IP, Email & browser ব্লকিং সিস্টেম",
                    "OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন",
                    "কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট",
                    "কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট",
                    "পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং",
                    "COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট",
                    "সন্দেহজনক অর্ডারে Instant Warning Popup",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-300 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                {!userId ? (
                  <LeadCTAButton serviceType="RevenuePro 6 Months" className="w-full py-3.5 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer text-sm">
                    শুরু করুন
                  </LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full py-3.5 block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm">
                    সাবস্ক্রাইব করুন
                  </Link>
                )}
              </div>
            </div>

            {/* 1 Year */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Ultimate Protection</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">1 Year Plan</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ২,৯৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/১ বছর</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">সম্পূর্ণ ফ্রড প্রোটেকশন ও প্রিমিয়াম স্কেলিং ফিচারস।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)",
                    "bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন",
                    "Partial Payment (আংশিক পেমেন্ট) সুবিধা",
                    "Automated Fraud Detection & ব্লকিং",
                    "পেমেন্ট মেথড অটো সুইচ (Switcher)",
                    "IP, Email & browser ব্লকিং সিস্টেম",
                    "OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন",
                    "কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট",
                    "কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট",
                    "পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং",
                    "COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট",
                    "সন্দেহজনক অর্ডারে Instant Warning Popup",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-emerald-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-650 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                {!userId ? (
                  <LeadCTAButton serviceType="RevenuePro 1 Year" className="w-full py-3.5 text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all cursor-pointer text-sm">
                    শুরু করুন
                  </LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full py-3.5 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all text-sm">
                    সাবস্ক্রাইব করুন
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 2: CODEPAY PRICING ═══════════ */}
        {activeTab === "codepay" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Monthly Router */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-teal-600 text-xs font-bold uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">Direct MFS</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">Monthly Router</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ১৫০</span>
                  <span className="text-slate-400 text-sm font-semibold">/মাস</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">ব্যক্তিগত বিকাশ/নগদে 0% কমিশন পেমেন্ট গ্রহণের জন্য সেরা শুরু।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "bKash Personal Direct Number Router",
                    "Nagad Personal Direct Number Router",
                    "Rocket & Upay Number Customizer",
                    "0% Gateway Commission Fee",
                    "SMS Listener Companion Mobile App",
                    "Real-time Automated TrxID Matching",
                    "Dynamic Brand Color Phone Customizer",
                    "Standard Email Support",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-teal-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-650 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link href="/codepay" className="w-full py-3.5 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all text-sm">
                  Get CodePay Starter
                </Link>
              </div>
            </div>

            {/* 6 Months Pro Router - BEST VALUE */}
            <div className="bg-slate-900 rounded-3xl border-2 border-teal-500/50 p-8 shadow-xl flex flex-col justify-between relative md:-translate-y-4 hover:scale-[1.01] transition-all duration-300">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border border-teal-400/40 inline-flex items-center gap-1 whitespace-nowrap">
                  ⭐ BEST VALUE
                </span>
              </div>
              
              <div>
                <h3 className="text-teal-400 font-extrabold text-xl mb-2 mt-2">6 Months Pro Router</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tight">৳ ৯০০</span>
                  <span className="text-slate-400 text-sm font-semibold">/৬ মাস</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">উন্নত ট্রানজেকশন ম্যাচিং এবং ফাস্ট অটো-কনফার্মেশন।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "bKash Personal Direct Number Router",
                    "Nagad Personal Direct Number Router",
                    "Rocket & Upay Number Customizer",
                    "0% Gateway Commission Fee",
                    "SMS Listener Companion Mobile App",
                    "Real-time Automated TrxID Matching",
                    "Dynamic Brand Color Phone Customizer",
                    "Multi-Channel Router Switcher",
                    "Priority Technical Support",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-teal-400 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-300 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link href="/codepay" className="w-full py-3.5 block text-center bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm">
                  Subscribe Pro Router
                </Link>
              </div>
            </div>

            {/* Lifetime Router */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-teal-600 text-xs font-bold uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">Unlimited Access</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">Lifetime Access</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ২,৪৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/এককালীন</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">একবার পেমেন্ট করে আজীবন সীমাহীন MFS চেকআউট পেমেন্ট রুট করার সুবিধা।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "All MFS Channels Included",
                    "Unlimited Transactions Syncing",
                    "Lifetime Updates & Security",
                    "Custom Brand Hex Picker",
                    "Android SMS Sync App License",
                    "Included FREE in RevenuePro Suite",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-teal-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-650 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link href="/codepay" className="w-full py-3.5 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all text-sm">
                  Get Lifetime License
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 3: EXPENSE TRACKER PRICING ═══════════ */}
        {activeTab === "expense" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Local Lifetime Plan */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">Local Storage Only</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">Local Lifetime</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ৯৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/এককালীন</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">লোকাল ডিভাইসে সীমাহীন লেনদেন এন্ট্রি ও ক্যাশফ্লো ম্যানেজমেন্ট।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "Offline / Local Device Storage Only",
                    "Manual & SMS Auto-Sync (Local)",
                    "Basic Inflow & Outflow Metrics",
                    "BDT & USD Currency Conversion",
                    "Excel / CSV Ledger Export",
                    "Lifetime Single Device License",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-indigo-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-650 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link href="/expense-tracker" className="w-full py-3.5 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all text-sm">
                  Get Local Lifetime
                </Link>
              </div>
            </div>

            {/* Cloud Sync Lifetime - BEST VALUE */}
            <div className="bg-slate-900 rounded-3xl border-2 border-indigo-500/50 p-8 shadow-xl flex flex-col justify-between relative md:-translate-y-4 hover:scale-[1.01] transition-all duration-300">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border border-indigo-400/40 inline-flex items-center gap-1 whitespace-nowrap">
                  ⭐ BEST VALUE
                </span>
              </div>
              
              <div>
                <h3 className="text-indigo-400 font-extrabold text-xl mb-2 mt-2">Cloud Sync Lifetime</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tight">৳ ১,৪৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/এককালীন</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">ক্লাউড স্টোরেজ, মাল্টি-ডিভাইস সিঙ্ক ও অটোমেটেড নোটিফিকেশন সিঙ্ক।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "Secure Cloud Database Storage",
                    "Multi-Device & Web App Sync",
                    "Automated MFS SMS Cloud Auto-Sync",
                    "Real-time bKash & Nagad Detection",
                    "Full Business Ledger Export",
                    "Custom Date & Calendar Filters",
                    "Priority Support & Cloud Backup",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-indigo-400 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-300 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link href="/expense-tracker" className="w-full py-3.5 block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm">
                  Get Cloud Lifetime
                </Link>
              </div>
            </div>

            {/* RevenuePro Bundle */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">Full Suite Bundle</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">RevenuePro Bundle</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">FREE</span>
                  <span className="text-slate-400 text-sm font-semibold">/RevenuePro-তে অন্তর্ভুক্ত</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">রেভিনিউপদ্ধতি সাবস্ক্রিপশনে ক্লাউড এক্সপেন্স ট্র্যাকার সম্পূর্ণ বিনামূল্যে উপভোগ করুন।</p>
                
                <div className="space-y-3.5 mb-8">
                  {[
                    "Included Free in RevenuePro Suite",
                    "Automated MFS SMS Auto-Sync",
                    "Full Business Ledger Export",
                    "Unlimited Accounts & Users",
                    "Priority 24/7 VIP Support",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <span className="text-indigo-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-slate-650 font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Link href="/revenuepro" className="w-full py-3.5 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all text-sm">
                  Explore RevenuePro Suite
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
