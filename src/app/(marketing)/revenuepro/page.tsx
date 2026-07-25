"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LeadCTAButton } from "@/components/LeadPopup";
import InteractiveImage from "@/components/InteractiveImage";

const revenueProFeatures = [
  { icon: "⚡", text: "Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)" },
  { icon: "🔍", text: "bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন" },
  { icon: "💰", text: "Partial Payment (আংশিক পেমেন্ট) সুবিধা" },
  { icon: "🛡️", text: "Automated Fraud Detection & ব্লকিং" },
  { icon: "🔄", text: "পেমেন্ট মেথড অটো সুইচ (Switcher)" },
  { icon: "🚫", text: "IP, Email & browser ব্লকিং সিস্টেম" },
  { icon: "📱", text: "OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন" },
  { icon: "🛒", text: "কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট" },
  { icon: "💬", text: "SMS Integration ও ওটিপি ভেরিফিকেশন" },
  { icon: "📦", text: "কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট" },
  { icon: "📈", text: "পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং" },
  { icon: "✅", text: "COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট" },
  { icon: "⚠️", text: "সন্দেহজনক অর্ডারে Instant Warning Popup" },
  { icon: "✨", text: "এবং আরও অনেক Premium Features" },
];

export default function RevenueProPage() {
  const { userId } = useAuth();
  
  // Tab states for abandoned carts section
  const [cartImageTab, setCartImageTab] = useState<"settings" | "logs">("settings");

  return (
    <div className="py-20 bg-slate-50 min-h-screen font-[var(--font-geist-sans)] overflow-x-hidden">
      {/* 1. Hero: Minimal & Professional (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">WooCommerce Protection Suite ✨</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-5 leading-tight max-w-4xl mx-auto">
          Secure Your WooCommerce Sales<br className="hidden md:inline" />{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent block md:inline mt-2 md:mt-0">
            With Automated Sales & Fraud Intelligence
          </span>
        </h1>
        <p className="text-slate-550 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
          Verify buyer delivery records automatically, recover abandoned carts, enforce security OTP, and automate courier dispatching in one place.
        </p>
        <div className="flex justify-center gap-4">
          {!userId ? (
            <LeadCTAButton serviceType="RevenuePro" className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-colors cursor-pointer">
              Install WordPress Plugin
            </LeadCTAButton>
          ) : (
            <Link href="/dashboard" className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-colors">
              Launch Dashboard
            </Link>
          )}
          <a href="#pricing" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
            Plans & Pricing
          </a>
        </div>
      </section>

      {/* 2. Visual Layout: WooCommerce Order Warning Panel Mockup (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-slate-400">WOOCOMMERCE ADMIN PANEL</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Order Verification Details</h2>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-100">Pending Review</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Customer Details */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Customer Info</span>
                <span className="block text-sm font-bold text-slate-800">Shehab Uddin</span>
                <span className="block text-xs text-slate-500 mt-1">Phone: 01712345678</span>
                <span className="block text-xs text-slate-500 mt-0.5">Location: Dhaka, BD</span>
              </div>
              <span className="block text-[10px] text-slate-400 mt-4">IP: 103.45.10.12</span>
            </div>

            {/* Fraud Statistics Indicator */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col justify-between md:col-span-2">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Courier Delivery Statistics</span>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 flex items-center justify-center text-sm font-black text-red-600">
                    29%
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-800">High Risk return rate detected</span>
                    <span className="block text-xs text-slate-500 mt-0.5">This customer cancelled 29 out of 41 past courier parcels.</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px]">
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High Risk Warning
                </span>
                <button className="text-slate-400 hover:text-slate-600 font-medium">Verify via Manual Call</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Dive Product Sections (Custom Layouts based on Image Shapes, max-w-6xl) */}
      <div className="space-y-32 max-w-6xl mx-auto px-4 sm:px-6 mb-32">
        
        {/* Section 1: bKash Integration (1 Image - Alternating) */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>⚡</span> Payout Automation
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Built-in bKash Payment Gateway
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              মার্চেন্ট অ্যাকাউন্ট ছাড়াই সরাসরি পার্সোনাল bKash ওয়ালেট যুক্ত করার সুবিধা। গ্রাহক চেকআউটে পেমেন্ট সম্পন্ন করে TrxID ইনপুট দিলে সিস্টেম স্বয়ংক্রিয়ভাবে লেনদেনের সত্যতা যাচাই করে অর্ডার কনফার্ম করে।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Test Sandbox মোডে পেমেন্ট সিমুলেশন ও টেস্টিং</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg transition-transform duration-250 hover:scale-[1.02]">
              <InteractiveImage
                src="/feature-bkash.png"
                alt="bKash Payment Settings Panel"
                width={865}
                height={481}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Partial Payment (1 Image - Alternating) */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>💰</span> Upfront Commitment
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Partial Payment (আংশিক পেমেন্ট)
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              কাস্টমার ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম করতে চাইলে upfront পার্সিয়াল শিপিং চার্জ bKash এর মাধ্যমে অগ্রিম প্রদান করতে হবে।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> ফিক্সড অ্যামাউন্ট অথবা পার্সেন্টেজ (%) অনুযায়ী হিসাব করার সুবিধা</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> বুকিং নিশ্চিত না করলে অর্ডার হোল্ডে রাখার নিরাপত্তা</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg transition-transform duration-250 hover:scale-[1.02]">
              <InteractiveImage
                src="/feature-partial.png"
                alt="Partial Payment Settings Configuration"
                width={865}
                height={275}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 3: OTP Verification (2 Vertical Images - Side-by-side Step flow) */}
        <section className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>📱</span> Buyer Verification
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              ক্যাশ অন ডেলিভারি (COD) অর্ডারের ক্ষেত্রে ভুয়া বা ডামি অর্ডার প্রতিরোধ করতে মোবাইল নম্বর ওটিপি ভেরিফিকেশন প্রম্পট।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> কুরিয়ার চার্জ আংশিক এডভান্স পেমেন্ট করার গেটওয়ে প্রম্পট</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> SMS Integration ও ওটিপি টাইমিং কাউন্টডাউন</li>
            </ul>
          </div>
          <div className="flex-1 flex items-center justify-center gap-6 max-w-lg mx-auto w-full">
            <div className="flex-1 text-center transition-transform duration-250 hover:scale-[1.02]">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Step 1: Send OTP</span>
              <InteractiveImage
                src="/otp-step-1.png"
                alt="OTP Verification: Request Verification Modal"
                width={440}
                height={520}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="text-slate-350 text-2xl font-bold shrink-0">➔</div>
            <div className="flex-1 text-center transition-transform duration-250 hover:scale-[1.02]">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Step 2: Submit Code</span>
              <InteractiveImage
                src="/otp-step-2.png"
                alt="OTP Verification: Code Verification Modal"
                width={440}
                height={520}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Automated Fraud Detection (Landscape dashboard + Vertical popup Collage overlay) */}
        <section className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>🛡️</span> Fraud Mitigation
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Automated Fraud Detection & ব্লকিং
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              সন্দেহজনক অর্ডারের ক্ষেত্রে কাস্টমারের পূর্বের ডেলিভারি রেশিও চেক করে অটোমেটিক ইনস্ট্যান্ট ওয়ার্নিং পপআপ বা কাস্টমারকে ব্লক করার ফিচার।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> IP, Email, Phone & Browser Fingerprint ব্লকিং</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> পেমেন্ট মেথড অটো সুইচ (Switcher) ব্যর্থ পেমেন্টের ক্ষেত্রে</li>
            </ul>
          </div>
          {/* Collage wrapper: Landscape layout in background, vertical modal absolute offset */}
          <div className="flex-1 relative w-full max-w-lg mx-auto min-h-[380px] flex items-center justify-start">
            {/* Landscape settings base */}
            <div className="w-5/6 shadow-md rounded-2xl overflow-hidden transition-transform duration-250 hover:scale-[1.01]">
              <InteractiveImage
                src="/feature-fraud.png"
                alt="Fraud Detection Protection Rules"
                width={865}
                height={539}
                className="w-full h-auto object-contain"
              />
            </div>
            {/* Absolute overlaying vertical modal */}
            <div className="absolute right-0 bottom-4 w-5/12 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 bg-white transition-transform duration-250 hover:scale-[1.05] hover:z-10">
              <InteractiveImage
                src="/fraud-popup.png"
                alt="Blocked Order Warning Modal on Checkout"
                width={440}
                height={520}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Abandoned Cart Recovery (2 Landscape images - Tabs Switcher) */}
        <section className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>🛒</span> Cart Recovery
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Abandoned Cart Recovery & Logs
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              গ্রাহক কার্টে ইনফরমেশন ফিল আপ করেও অর্ডার সম্পূর্ণ না করলে নির্দিষ্ট সময় পর অটোমেটিক রিকভারি ইমেইল ও SMS পাঠিয়ে অর্ডার সম্পূর্ণ করতে উৎসাহিত করে।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> কাস্টম ইমেইল এবং SMS রিকভারি টেমপ্লেট ও কাউন্টার</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Abandoned Carts লগ ও রিকভারি স্ট্যাটাস ট্র্যাকিং</li>
            </ul>
          </div>

          {/* Premium Image Tab Selector Container */}
          <div className="flex-1 w-full max-w-lg mx-auto space-y-3">
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button 
                onClick={() => setCartImageTab("settings")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cartImageTab === "settings" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Settings Panel
              </button>
              <button 
                onClick={() => setCartImageTab("logs")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cartImageTab === "logs" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Abandoned Logs Table
              </button>
            </div>
            <div className="transition-all duration-300">
              {cartImageTab === "settings" ? (
                <div className="transition-transform duration-250 hover:scale-[1.02]">
                  <InteractiveImage
                    src="/feature-cart.png"
                    alt="Abandoned Cart settings panel"
                    width={864}
                    height={450}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="transition-transform duration-250 hover:scale-[1.02]">
                  <InteractiveImage
                    src="/feature-carts-log.png"
                    alt="Abandoned and Recovered Carts Log Dashboard"
                    width={1016}
                    height={445}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 6: SMS Notification (1 Image - Alternating) */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>💬</span> Messaging Channels
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              SMS Notification & Integration
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              অর্ডার সাকসেস বা প্রসেসিং সংক্রান্ত নোটিফিকেশন BulkSMSBD প্রোভাইডারের মাধ্যমে কাস্টমারের ফোন নম্বরে অটো চলে যাবে।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> BulkSMSBD গেটওয়ে এপিআই ইন্টিগ্রেশন প্যানেল</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> নির্দিষ্ট কাস্টম অর্ডার স্ট্যাটাসে অটো ট্রিগার</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg transition-transform duration-250 hover:scale-[1.02]">
              <InteractiveImage
                src="/feature-sms.png"
                alt="SMS Notifications Provider Settings"
                width={864}
                height={539}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 7: Courier Automation (1 Image - Alternating) */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>📦</span> Logistics
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Courier Dispatch Automation
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              অর্ডার হওয়ার সাথে সাথেই কুরিয়ারে অটো বুকিং চলে যাবে এবং ডেলিভারি স্ট্যাটাস আপডেট হলে অর্ডারের নোটও স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> API key ও Secret Key সংরক্ষণের সুরক্ষিত ডাটাবেস</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> স্বয়ংক্রিয় ডেলিভারি স্ট্যাটাস ট্র্যাকিং ও ম্যাপিং</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg transition-transform duration-250 hover:scale-[1.02]">
              <InteractiveImage
                src="/feature-courier.png"
                alt="Courier Automation Settings with Webhooks"
                width={865}
                height={539}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 8: Pixel & UTM Tracking (1 Image - Alternating) */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>📈</span> Analytics
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Meta Pixel & UTM Attribution Tracking
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              কনভার্সন ট্র্যাক এবং ক্যাম্পেইন অপটিমাইজেশনের জন্য ফেসবুক পিক্সেল ও সার্ভার-সাইড কনভার্সন এপিআই (CAPI) ইন্টিগ্রেশন।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Conversions API (Server-Side) ও ডোমেইন ভেরিফিকেশন কোড</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> UTM Attribution ট্র্যাকিং স্বয়ংক্রিয় অর্ডার মেটাবেড</li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg transition-transform duration-250 hover:scale-[1.02]">
              <InteractiveImage
                src="/feature-tracking.png"
                alt="Meta Pixel and Conversions API Settings with UTM Attribution"
                width={865}
                height={539}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section 9: COD Quick Order Placement (Landscape Settings + Vertical phone Collage overlay) */}
        <section className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span>⚡</span> Checkout UX
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              COD Quick Order Placement
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              গ্রাহকদের দ্রুত চেকআউট সুবিধা দিতে ওয়ান-ক্লিক পপআপ কুইক অর্ডার ফর্ম এবং অ্যাডমিন প্যানেল থেকে ফিল্ড কাস্টমাইজেশন।
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> চেকআউট ফিল্ডের লেবেল ও প্লেসহোল্ডার টেক্সট কাস্টমাইজেশন</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> পপআপ চেকআউট ফর্ম এবং ডেলিভারি চার্জ নির্ধারণ</li>
            </ul>
          </div>
          {/* Collage wrapper: Landscape settings panel with absolute overlapping phone form */}
          <div className="flex-1 relative w-full max-w-lg mx-auto min-h-[380px] flex items-center justify-start">
            {/* Landscape settings base */}
            <div className="w-10/12 shadow-md rounded-2xl overflow-hidden transition-transform duration-250 hover:scale-[1.01]">
              <InteractiveImage
                src="/feature-general-ux.png"
                alt="Checkout UX Enhancements and Billing Fields settings"
                width={907}
                height={570}
                className="w-full h-auto object-contain"
              />
            </div>
            {/* Absolute overlaying vertical phone modal */}
            <div className="absolute right-2 -top-6 w-[170px] shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-800 bg-white transition-transform duration-250 hover:scale-[1.05] hover:z-10">
              <InteractiveImage
                src="/feature-quick-order.png"
                alt="Quick Order Checkout Form Popup Modal Mockup"
                width={260}
                height={510}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

      </div>

      {/* 4. Core Features List Grid (max-w-6xl) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 border-t border-slate-200/50 pt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">প্লাগইনের প্রধান ফিচারসমূহ</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            আপনার ই-কমার্স ব্যবসাকে স্বয়ংক্রিয় এবং লোকসান-মুক্ত করতে প্রয়োজনীয় সব ফিচার এক প্লাগইনে।
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {revenueProFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/60 hover:border-emerald-500/20 hover:shadow-xs transition-all">
              <span className="text-lg leading-none shrink-0">{feat.icon}</span>
              <span className="text-sm font-medium text-slate-700">{feat.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Pricing Section (max-w-6xl) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 border-t border-slate-200/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Simple Transparent Licensing</h2>
          <p className="text-slate-500 text-sm mt-2">No transaction charges. Select a license package based on your verification duration.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-4xl mx-auto">
          {/* Monthly */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Starter</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">Monthly Plan</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ২৪৯</span>
                <span className="text-slate-400 text-xs">/মাস</span>
              </div>
              <p className="text-slate-550 text-xs leading-relaxed mb-6">Perfect for small operations needing automated order checking channels.</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2">✓ Automated Fraud Checks</li>
                <li className="flex items-center gap-2">✓ Automated Courier Booking</li>
                <li className="flex items-center gap-2">✓ Abandoned Cart Auto alerts</li>
                <li className="flex items-center gap-2">✓ Built-in bKash verification</li>
              </ul>
            </div>
            {!userId ? (
              <LeadCTAButton serviceType="RevenuePro Monthly" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center cursor-pointer">Subscribe</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center">Subscribe Now</Link>
            )}
          </div>

          {/* 6 Months */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm flex flex-col justify-between relative hover:scale-[1.01] transition-transform">
            <span className="absolute -top-3 left-6 bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">Popular</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">6 Months Plan</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ১,৪৯৯</span>
                <span className="text-slate-400 text-xs">/৬ মাস</span>
              </div>
              <p className="text-slate-550 text-xs leading-relaxed mb-6">Enables developers to set up advanced API failover channels.</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2 font-bold text-slate-800">✓ All starter features</li>
                <li className="flex items-center gap-2">✓ SMS Integration & OTP</li>
                <li className="flex items-center gap-2">✓ Multi-user dashboard seats</li>
                <li className="flex items-center gap-2">✓ Dedicated chat support</li>
              </ul>
            </div>
            {!userId ? (
              <LeadCTAButton serviceType="RevenuePro 6 Months" className="w-full py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-xs text-center cursor-pointer">Subscribe</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-xs text-center">Subscribe Now</Link>
            )}
          </div>

          {/* 1 Year */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Best Value</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">1 Year Plan</h3>
              <div className="my-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900">৳ ২,৯৯৯</span>
                <span className="text-slate-400 text-xs">/বছর</span>
              </div>
              <p className="text-slate-550 text-xs leading-relaxed mb-6">For massive e-commerce setups seeking uninterrupted checks.</p>
              
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                <li className="flex items-center gap-2">✓ All Pro features</li>
                <li className="flex items-center gap-2">✓ Custom warning popup edit</li>
                <li className="flex items-center gap-2">✓ Zero database limits</li>
                <li className="flex items-center gap-2">✓ Dedicated SLA channels</li>
              </ul>
            </div>
            {!userId ? (
              <LeadCTAButton serviceType="RevenuePro 1 Year" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center cursor-pointer">Subscribe</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-xs text-center">Subscribe Now</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
