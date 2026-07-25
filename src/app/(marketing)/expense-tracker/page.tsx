"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

export default function ExpenseTrackerPage() {
  const { userId } = useAuth();
  
  // Weekly vs Monthly chart data states
  const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">("weekly");
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  
  // Image tab state for Web Dashboard screenshots
  const [webDashboardTab, setWebDashboardTab] = useState<"bdt" | "usd">("bdt");

  // Chart values
  const weeklyData = [
    { label: "Mon", inflow: 12000, outflow: 4000 },
    { label: "Tue", inflow: 8000, outflow: 2500 },
    { label: "Wed", inflow: 15000, outflow: 6000 },
    { label: "Thu", inflow: 9500, outflow: 3000 },
    { label: "Fri", inflow: 18000, outflow: 5500 },
    { label: "Sat", inflow: 11000, outflow: 2000 },
    { label: "Sun", inflow: 14000, outflow: 4500 },
  ];

  const monthlyData = [
    { label: "Week 1", inflow: 52000, outflow: 18000 },
    { label: "Week 2", inflow: 48000, outflow: 12000 },
    { label: "Week 3", inflow: 65000, outflow: 22000 },
    { label: "Week 4", inflow: 59000, outflow: 15000 },
  ];

  const activeData = chartPeriod === "weekly" ? weeklyData : monthlyData;

  const formatMoney = (val: number) => {
    if (currency === "USD") {
      return `$${Math.round(val / 120)}`;
    }
    return `৳${val.toLocaleString()}`;
  };

  return (
    <div className="py-20 bg-slate-50 min-h-screen font-[var(--font-geist-sans)] overflow-x-hidden">
      {/* 1. Hero: Finance Theme (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-150 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-550 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">Cashflow Ledger Automation ✨</span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
          Automate Personal & Business<br />
          <span className="bg-gradient-to-r from-indigo-650 to-violet-500 bg-clip-text text-transparent">
            Cashflow Ledger Bookkeeping
          </span>
        </h1>
        <p className="text-slate-550 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
          Stop logging cash inflows and outflows by hand. Automatically sync payments from MFS SMS texts directly to your visual financial board.
        </p>
        <div className="flex justify-center gap-4">
          {!userId ? (
            <Link href="/sign-up" className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
              Get Started Free
            </Link>
          ) : (
            <Link href="/dashboard" className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
              Open My Ledger Dashboard
            </Link>
          )}
          <a href="#pricing" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
            View Plans
          </a>
        </div>
      </section>

      {/* 2. Visual Layout: Gradient Inflow/Outflow Chart Widget (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-slate-400">MONEY INTELLIGENCE DASHBOARD</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Cashflow Trend Analytics</h2>
            </div>
            
            {/* Interactive Period + Currency Switcher */}
            <div className="flex gap-2">
              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 flex text-[10px] font-bold">
                <button
                  onClick={() => setChartPeriod("weekly")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${chartPeriod === "weekly" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartPeriod("monthly")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${chartPeriod === "monthly" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                >
                  Monthly
                </button>
              </div>

              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 flex text-[10px] font-bold">
                <button
                  onClick={() => setCurrency("BDT")}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${currency === "BDT" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                >
                  ৳ BDT
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${currency === "USD" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          {/* Simulated Chart Container */}
          <div className="space-y-4">
            <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-100 pb-2">
              {activeData.map((bar) => {
                // Compute height percentage base
                const maxVal = chartPeriod === "weekly" ? 20000 : 80000;
                const inflowHeight = Math.min((bar.inflow / maxVal) * 100, 100);
                const outflowHeight = Math.min((bar.outflow / maxVal) * 100, 100);

                return (
                  <div key={bar.label} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Hover tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[9px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center min-w-[70px]">
                      <span className="block text-emerald-400">In: {formatMoney(bar.inflow)}</span>
                      <span className="block text-red-400">Out: {formatMoney(bar.outflow)}</span>
                    </div>

                    <div className="w-full flex items-end gap-1 h-full">
                      {/* Inflow bar (emerald) */}
                      <div
                        style={{ height: `${inflowHeight}%` }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500 to-teal-400 min-h-[4px] hover:brightness-105 transition-all duration-300"
                      />
                      {/* Outflow bar (rose) */}
                      <div
                        style={{ height: `${outflowHeight}%` }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-rose-500 to-red-400 min-h-[4px] hover:brightness-105 transition-all duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">{bar.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs font-semibold justify-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-sm"></span>
                Inflows
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 bg-gradient-to-br from-rose-500 to-red-400 rounded-sm"></span>
                Outflows
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Granular Reporting & Exporter Channels (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Granular Auditing Tools</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Audit cashflow parameters with custom intervals, date presets, and exporter channels.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-xl">⏱️</span>
            <h3 className="text-sm font-bold text-slate-800 mt-3">Multi-Period Filters</h3>
            <p className="text-slate-550 text-xs mt-1.5 leading-relaxed">
              Compare ledger performances using dedicated tab sheets for This Month, Last 15 Days, and This Week.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-xl">🗂️</span>
            <h3 className="text-sm font-bold text-slate-800 mt-3">Sender Address Search</h3>
            <p className="text-slate-550 text-xs mt-1.5 leading-relaxed">
              Type or filter sender wallet addresses to check payouts to specific suppliers or customers immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <span className="text-xl">📥</span>
            <h3 className="text-sm font-bold text-slate-800 mt-3">Excel/XLS Logs Export</h3>
            <p className="text-slate-550 text-xs mt-1.5 leading-relaxed">
              Compile your synced transaction ledger data and download a clean CSV/XLS layout for official bookkeeping.
            </p>
          </div>
        </div>
      </section>

      {/* 4. New Section: Web Dashboard Showcase (max-w-6xl, borderless image switcher) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32 border-t border-slate-200/50 pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              <span>🖥️</span> Web Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              অটোমেটেড ওয়েব ড্যাশবোর্ড অ্যানালিটিক্স
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              ওয়েব ব্রাউজার থেকে সরাসরি আপনার বিকাশ, নগদ বা রকেটের ক্যাশফ্লো মনিটর করুন। অটোমেটিক কারেন্সি কনভার্সন এবং বিস্তারিত ক্যালকুলেশন প্যানেলের সাহায্যে আপনার সমস্ত ব্যবসায়িক ও ব্যক্তিগত হিসাব ট্র্যাক করুন।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-650">
              <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> BDT ও USD কারেন্সি সুইচিং সাপোর্ট</li>
              <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> সোর্সভিত্তিক Synced Transactions Ledger</li>
            </ul>
          </div>

          {/* Web Switcher Image */}
          <div className="flex-1 w-full max-w-lg mx-auto space-y-3">
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button 
                onClick={() => setWebDashboardTab("bdt")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  webDashboardTab === "bdt" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                BDT (৳) Balance View
              </button>
              <button 
                onClick={() => setWebDashboardTab("usd")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  webDashboardTab === "usd" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                USD ($) Balance View
              </button>
            </div>
            <div className="transition-transform duration-250 hover:scale-[1.02] flex justify-center">
              {webDashboardTab === "bdt" ? (
                <Image
                  src="/expense-dashboard-bdt-v3.png"
                  alt="Expense Tracker Web Dashboard BDT view"
                  width={865}
                  height={481}
                  className="w-full h-auto object-contain bg-transparent"
                  unoptimized
                />
              ) : (
                <Image
                  src="/expense-dashboard-usd-v3.png"
                  alt="Expense Tracker Web Dashboard USD view"
                  width={865}
                  height={275}
                  className="w-full h-auto object-contain bg-transparent"
                  unoptimized
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Section: Mobile Companion App (max-w-6xl, 3 borderless screens side-by-side) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32 border-t border-slate-200/50 pt-20">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              <span>📱</span> Mobile Companion
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              মোবাইল বুককিপিং অ্যাসোসিয়েট অ্যাপ
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              অ্যান্ড্রয়েড ফোনের নোটিফিকেশন সিঙ্ক টুলের মাধ্যমে রিয়েল-টাইমে বিকাশ এসএমএস ডিটেক্ট করে ক্যাশ ইন এবং ক্যাশ আউট এন্ট্রি অটো-লগ করুন।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-655">
              <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> ক্যাটাগরি অনুযায়ী ক্যাশফ্লো অ্যালোকেশন চার্ট</li>
              <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> ট্রানজেকশন অ্যাক্টিভিটি হিস্ট্রি ও অফলাইন বুকিং সুবিধা</li>
            </ul>
          </div>

          {/* Grid of 3 Mobile Screens */}
          <div className="flex-1 grid grid-cols-3 gap-4 items-start w-full max-w-lg mx-auto">
            <div className="transition-transform duration-250 hover:scale-[1.02] text-center space-y-1.5">
              <span className="block text-[8px] font-bold text-slate-450 uppercase">Allocations</span>
              <Image
                src="/expense-mobile-main-v3.png"
                alt="Expense Mobile Main allocations"
                width={865}
                height={539}
                className="w-full h-auto object-contain bg-transparent"
                unoptimized
              />
            </div>
            <div className="transition-transform duration-250 hover:scale-[1.02] text-center space-y-1.5">
              <span className="block text-[8px] font-bold text-slate-450 uppercase">Add Record</span>
              <Image
                src="/expense-mobile-add-v3.png"
                alt="Expense Mobile Add record form"
                width={864}
                height={450}
                className="w-full h-auto object-contain bg-transparent"
                unoptimized
              />
            </div>
            <div className="transition-transform duration-250 hover:scale-[1.02] text-center space-y-1.5">
              <span className="block text-[8px] font-bold text-slate-450 uppercase">Activity</span>
              <Image
                src="/expense-mobile-activity-v3.png"
                alt="Expense Mobile Ledger history activity"
                width={864}
                height={539}
                className="w-full h-auto object-contain bg-transparent"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Plans (max-w-6xl) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 border-t border-slate-200/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Choose Your Tracker Plan</h2>
          <p className="text-slate-500 text-sm mt-2">Get started free or sync your mobile MFS transaction alerts automatically.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-4xl mx-auto">
          {/* Local Lifetime */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-colors shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded font-mono">Local Storage Only</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">Local Lifetime</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ৯৯৯</span>
                <span className="text-slate-400 text-xs">/এককালীন</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">লোকাল ডিভাইসে সীমাহীন লেনদেন এন্ট্রি ও ক্যাশফ্লো ট্র্যাকিং।</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2">✓ Offline / Local Device Storage Only</li>
                <li className="flex items-center gap-2">✓ Manual & SMS Auto-Sync (Local)</li>
                <li className="flex items-center gap-2">✓ BDT & USD Currency Conversion</li>
                <li className="flex items-center gap-2">✓ Lifetime Single Device License</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center">
              Get Local Lifetime
            </Link>
          </div>

          {/* Cloud Sync Lifetime - Recommended */}
          <div className="bg-white rounded-2xl border-2 border-indigo-600 p-6 flex flex-col justify-between relative hover:scale-[1.01] transition-transform shadow-xs">
            <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">⭐ Best Value</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">Cloud Sync Lifetime</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ১,৪৯৯</span>
                <span className="text-slate-400 text-xs">/এককালীন</span>
              </div>
              <p className="text-slate-550 text-xs leading-relaxed mb-6">
                ক্লাউড স্টোরেজ, মাল্টি-ডিভাইস সিঙ্ক ও অটোমেটেড এসএমএস নোটিফিকেশন সিঙ্ক।
              </p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2 font-bold text-slate-800">✓ Secure Cloud Database Storage</li>
                <li className="flex items-center gap-2">✓ Multi-Device & Web App Sync</li>
                <li className="flex items-center gap-2">✓ Automated MFS SMS Cloud Auto-Sync</li>
                <li className="flex items-center gap-2">✓ XLS/CSV Ledger Compilation Export</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-xs text-center">
              Get Cloud Lifetime
            </Link>
          </div>

          {/* RevenuePro Bundle */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-colors shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded font-mono">Suite Bundle</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">RevenuePro Bundle</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">FREE</span>
                <span className="text-slate-400 text-xs">/RevenuePro-তে অন্তর্ভুক্ত</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">রেভিনিউপদ্ধতি সাবস্ক্রিপশনে ক্লাউড এক্সপেন্স ট্র্যাকার সম্পূর্ণ ফ্রি।</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2">✓ Included Free in RevenuePro Suite</li>
                <li className="flex items-center gap-2">✓ Automated MFS SMS Auto-Sync</li>
                <li className="flex items-center gap-2">✓ Full Business Ledger Export</li>
                <li className="flex items-center gap-2">✓ Priority 24/7 VIP Support</li>
              </ul>
            </div>
            <Link href="/revenuepro" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center">
              Explore RevenuePro Suite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
