"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

export default function CodePayPage() {
  const { userId } = useAuth();
  
  // Customizer States
  const [themeColor, setThemeColor] = useState("#0d9488"); // Default Teal
  const [brandName, setBrandName] = useState("My Store");
  const [customColor, setCustomColor] = useState("#0d9488");

  const handlePresetColor = (color: string) => {
    setThemeColor(color);
    setCustomColor(color);
  };

  return (
    <div className="py-20 bg-slate-50 min-h-screen font-[var(--font-geist-sans)] overflow-x-hidden">
      {/* 1. Hero: Developer Centric (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-teal-150 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">MFS Checkout Router ✨</span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
          Accept MFS Payments Directly<br />
          <span className="bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Without Gateway Commissions
          </span>
        </h1>
        <p className="text-slate-550 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
          Route checkout payments straight to your personal bKash, Nagad, or Rocket numbers. Verify Transactions using SMS notifications pushed from our companion Android sync app.
        </p>
        <div className="flex justify-center gap-4">
          {!userId ? (
            <Link href="/sign-up" className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
              Get Started Free
            </Link>
          ) : (
            <Link href="/dashboard" className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
              Open Settings Dashboard
            </Link>
          )}
          <a href="#pricing" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
            View Pricing
          </a>
        </div>
      </section>

      {/* 2. Interactive Feature: Checkout Brand Customizer Simulator (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Custom Branding Customizer</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Design the checkout pane layout. Pick your brand color, logo parameters, and theme elements below.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 flex flex-col lg:flex-row gap-12 items-center">
          {/* Customizer Panel */}
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Custom Brand Name</h3>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
                placeholder="e.g. Trendy BD"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Theme Color Presets</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Teal", val: "#0d9488" },
                  { label: "bKash Pink", val: "#e2125a" },
                  { label: "Nagad Orange", val: "#f35923" },
                  { label: "Dark Indigo", val: "#4f46e5" },
                ].map((color) => (
                  <button
                    key={color.val}
                    onClick={() => handlePresetColor(color.val)}
                    className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    style={{
                      borderColor: customColor === color.val ? color.val : "#e2e8f0",
                      color: customColor === color.val ? color.val : "#475569",
                      boxShadow: customColor === color.val ? `0 0 12px ${color.val}15` : "none",
                    }}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-slate-400 font-medium">Or pick custom hex color:</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => { setCustomColor(e.target.value); setThemeColor(e.target.value); }}
                  className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0 overflow-hidden shrink-0"
                />
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{customColor}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 block mb-1">💡 Zero Commissions Policy</span>
              Standard merchant accounts charge up to 2.5% per sale. CodePay runs 100% free of transaction commission limits — all money moves wallet-to-wallet directly.
            </div>
          </div>

          {/* Real-time Simulated Widget wrapped in Phone mock */}
          <div 
            style={{ borderColor: themeColor }}
            className="w-full lg:w-96 bg-slate-100 rounded-[36px] p-5 flex items-center justify-center border-4 shadow-inner relative max-w-sm mx-auto transition-colors duration-300"
          >
            {/* Mock Bezel top notch colored as channel */}
            <div 
              style={{ backgroundColor: themeColor }}
              className="absolute top-7 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full z-10 opacity-70 transition-colors duration-300"
            />
            
            <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden text-xs relative pt-4 min-h-[360px] flex flex-col justify-between border-0">
              {/* Header colored dynamically */}
              <div
                style={{ backgroundColor: themeColor }}
                className="p-4 text-white flex items-center justify-between transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    {brandName.charAt(0).toUpperCase() || "C"}
                  </div>
                  <span className="font-bold tracking-tight">{brandName || "My Store"}</span>
                </div>
                <span className="text-[10px] opacity-80 font-semibold">Pay Safe</span>
              </div>

              <div className="p-4 space-y-4 flex-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Amount Due</span>
                  <span className="text-xl font-black text-slate-800">৳ ১,২৫০</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Send Money to Wallet</span>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-800 font-bold">017XXXXXXXX</span>
                    <span className="text-slate-400 text-[10px] cursor-pointer hover:text-slate-600 font-bold">Copy</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Enter TrxID</span>
                  <input
                    type="text"
                    disabled
                    placeholder="e.g. BLA8912389"
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  style={{ backgroundColor: themeColor }}
                  className="w-full py-2 text-white font-bold rounded-lg hover:brightness-105 transition-all text-xs cursor-pointer"
                >
                  Verify Payment ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dedicated Visual Sections for Each Payment Channel (max-w-6xl, no backgrounds/borders on images) */}
      <div className="space-y-32 max-w-6xl mx-auto px-4 sm:px-6 mb-32 border-t border-slate-200/50 pt-20">
        
        {/* Router Options Selection */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-teal-600 font-bold text-xs uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              <span>🔀</span> Smart Router
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              MFS Checkout Router Screen
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              গ্রাহক চেকআউটে এসে তার সুবিধাজনক মোবাইল ব্যাংকিং বা ব্যাংক ট্রান্সফার অপশন এক ক্লিকে বাছাই করতে পারেন।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-teal-500 font-bold">✓</span> bKash, Nagad, Rocket, Upay, CellFin ও Tap চ্যানেলের উপস্থিতি</li>
              <li className="flex items-center gap-2"><span className="text-teal-500 font-bold">✓</span> পেমেন্ট প্রসেস সম্পূর্ণ করতে এক ক্লিকের গেটওয়ে রিডাইরেক্ট</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-xs transition-transform duration-250 hover:scale-[1.02]">
              <Image
                src="/codepay-options.png"
                alt="CodePay MFS Checkout Router Options Selection"
                width={453}
                height={459}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* bKash Section */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[#e2125a] font-bold text-xs uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
              <span>🌸</span> bKash Verification
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              বিকাশ পেমেন্ট গেটওয়ে নির্দেশনাবলী
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              বিকাশ সিলেক্ট করার পর কাস্টমারকে সরাসরি বিকাশ অ্যাপ ব্যবহার করে পার্সোনাল নাম্বারে টাকা পাঠানোর চিত্রসহ দিকনির্দেশনা দেখায়।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-[#e2125a] font-bold">✓</span> বিকাশ আইকন ও সঠিক অ্যামাউন্ট কপি করার ওয়ান-ক্লিক শর্টকাট</li>
              <li className="flex items-center gap-2"><span className="text-[#e2125a] font-bold">✓</span> ৫ মিনিটের সেশন কাউন্টডাউন সিকিউরিটি এবং অটো সিঙ্ক ট্র্যাকিং</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-xs transition-transform duration-250 hover:scale-[1.02]">
              <Image
                src="/codepay-bkash.png"
                alt="bKash Payment Instruction panel configuration"
                width={406}
                height={487}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Nagad Section */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[#f35923] font-bold text-xs uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
              <span>🔥</span> Nagad Channel
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              নগদ পেমেন্ট গেটওয়ে নির্দেশনাবলী
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              নগদের নিজস্ব থিমে ডিজাইনকৃত নির্দেশনাবলী স্ক্রিন। কাস্টমার অ্যাপ থেকে সেন্ড মানি করে TrxID সাবমিট করলে অটো ভেরিফাই সম্পন্ন হয়।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-[#f35923] font-bold">✓</span> নগদ সেন্ড মানি আইকন ও নম্বর কপির সহজ ব্যবস্থা</li>
              <li className="flex items-center gap-2"><span className="text-[#f35923] font-bold">✓</span> কমিশন-মুক্ত সরাসরি ওয়ালেট-টু-ওয়ালেট পেমেন্ট গ্রহণ</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[240px] transition-transform duration-250 hover:scale-[1.02]">
              <Image
                src="/codepay-nagad.png"
                alt="Nagad Payment Instruction panel configuration"
                width={331}
                height={582}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Rocket Section */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[#8c3494] font-bold text-xs uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
              <span>🔮</span> Rocket Integration
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              রকেট পেমেন্ট গেটওয়ে নির্দেশনাবলী
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              রকেট ব্যবহারকারী ক্রেতাদের জন্য চমৎকার পেমেন্ট প্যানেল ও সাকসেস নোটিফিকেশন সিঙ্ক ও অটো ট্রানজেকশন ম্যাচিং।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-[#8c3494] font-bold">✓</span> রকেট লোগো থিম ও ওয়ান-ট্যাপ ট্রানজেকশন কপির অপশন</li>
              <li className="flex items-center gap-2"><span className="text-[#8c3494] font-bold">✓</span> সরাসরি ব্যক্তিগত রকেট ওয়ালেটে টাকা জমা হওয়ার নিশ্চয়তা</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-xs transition-transform duration-250 hover:scale-[1.02]">
              <Image
                src="/codepay-rocket.png"
                alt="Rocket Payment Instruction panel configuration"
                width={485}
                height={583}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Upay Section */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[#f0c300] font-bold text-xs uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
              <span>💛</span> Upay Direct Charge
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              উপায় পেমেন্ট গেটওয়ে নির্দেশনাবলী
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              উপায় ওয়ালেটের জন্য সরাসরি পেমেন্ট ভেরিফিকেশন ফরম। কাস্টমার তার উপায় ওয়ালেট নম্বর ইনপুট দিয়ে পেমেন্ট সম্পাদন করতে পারে।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-[#f0c300] font-bold">✓</span> উপায় থিম কালার ও ডাইরেক্ট অ্যাকাউন্ট ইনপুট ভ্যালিডেশন</li>
              <li className="flex items-center gap-2"><span className="text-[#f0c300] font-bold">✓</span> টার্মস অ্যান্ড কন্ডিশন ও নিরাপদ ওটিপি পিন সাবমিশন গেটওয়ে</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-xs transition-transform duration-250 hover:scale-[1.02]">
              <Image
                src="/codepay-upay.png"
                alt="Upay Direct Number input payment settings"
                width={485}
                height={531}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

      </div>

      {/* 4. Pricing Plans (max-w-6xl) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 border-t border-slate-200/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Choose Your Gateway Plan</h2>
          <p className="text-slate-500 text-sm mt-2">Scale wallet accounts dynamically. No percentage commission charges forever.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-4xl mx-auto">
          {/* Monthly */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-teal-500/30 transition-colors shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded font-mono">Monthly</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">Monthly Router</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ১৫০</span>
                <span className="text-slate-400 text-xs">/মাস</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">ব্যক্তিগত বিকাশ/নগদে 0% কমিশন পেমেন্ট গ্রহণের জন্য সেরা শুরু।</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2">✓ All MFS Personal Routers</li>
                <li className="flex items-center gap-2">✓ Android SMS Sync Companion</li>
                <li className="flex items-center gap-2">✓ 0% Gateway Commission Fee</li>
                <li className="flex items-center gap-2">✓ Real-time TrxID Auto-Matching</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center">
              Get Monthly Router
            </Link>
          </div>

          {/* 6 Months - Best Value */}
          <div className="bg-white rounded-2xl border-2 border-teal-500 p-6 flex flex-col justify-between relative hover:scale-[1.01] transition-transform shadow-xs">
            <span className="absolute -top-3 left-6 bg-teal-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">⭐ Best Value</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">6 Months Pro Router</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ৯০০</span>
                <span className="text-slate-400 text-xs">/৬ মাস</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">উন্নত ট্রানজেকশন ম্যাচিং এবং ফাস্ট অটো-কনফার্মেশন।</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2 font-bold text-slate-800">✓ All MFS Personal Routers</li>
                <li className="flex items-center gap-2">✓ Android SMS Sync Companion</li>
                <li className="flex items-center gap-2">✓ Dynamic Brand Color Customizer</li>
                <li className="flex items-center gap-2">✓ Priority Technical Support</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors text-xs text-center">
              Subscribe Pro Router
            </Link>
          </div>

          {/* Lifetime Access */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-teal-500/30 transition-colors shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded font-mono">Unlimited</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">Lifetime Access</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ২,৪৯৯</span>
                <span className="text-slate-400 text-xs">/এককালীন</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">একবার পেমেন্ট করে আজীবন সীমাহীন MFS চেকআউট পেমেন্ট রুট।</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2 font-bold text-slate-800">✓ Unlimited Transactions Syncing</li>
                <li className="flex items-center gap-2">✓ Lifetime Security & App Updates</li>
                <li className="flex items-center gap-2">✓ Multi-Channel Router Switcher</li>
                <li className="flex items-center gap-2">✓ Included FREE in RevenuePro Suite</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center">
              Get Lifetime License
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
