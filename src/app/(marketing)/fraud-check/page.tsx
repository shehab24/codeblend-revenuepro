"use client";

import Link from "next/link";
import { useState } from "react";
import { checkFraudData } from "@/actions/fraudCheck";

type CourierRow = {
  name: string;
  order: number;
  delivered: number;
  cancelled: number;
  rate: number;
};

type FraudStats = {
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
  couriers: CourierRow[];
};

export default function FraudCheckPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<FraudStats | null>(null);

  const handleSearch = async () => {
    if (!phone || phone.length < 11) {
      setError("Please enter a valid 11 digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    
    // Clean up "+88" if user typed it accidentally
    const cleanPhone = phone.replace("+88", "").trim();

    try {
      const res = await checkFraudData(cleanPhone);
      if (res.success && res.data) {
        const d = res.data as any;

        // Build per-courier rows from the rich API response
        const couriers: CourierRow[] = [
          { name: "Steadfast", delivered: d.steadfast_success || 0, cancelled: d.steadfast_cancel || 0 },
          { name: "Pathao", delivered: d.pathao_success || 0, cancelled: d.pathao_cancel || 0 },
          { name: "RedX", delivered: d.redx_success || 0, cancelled: d.redx_cancel || 0 },
          { name: "ParcelDex", delivered: d.parceldex_success || 0, cancelled: d.parceldex_cancel || 0 },
          { name: "PaperFly", delivered: d.paperfly_success || 0, cancelled: d.paperfly_cancel || 0 },
          { name: "CarryBee", delivered: d.carrybee_success || 0, cancelled: d.carrybee_cancel || 0 },
        ].map(c => ({
          ...c,
          order: c.delivered + c.cancelled,
          rate: (c.delivered + c.cancelled) > 0 ? Math.round((c.delivered / (c.delivered + c.cancelled)) * 100) : 0
        }));

        setStats({
          total_parcel: d.total_parcel || 0,
          success_parcel: d.success_parcel || 0,
          cancelled_parcel: d.cancelled_parcel || 0,
          success_ratio: d.success_ratio || 0,
          couriers
        });
      } else {
        setError(res.error || "Failed to fetch data.");
      }
    } catch (e: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const successRate = stats ? Math.round(stats.success_ratio) : 0;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* --- Top Section: 2 Columns --- */}
        <div className="grid md:grid-cols-[1fr_2.5fr] gap-6">
          
          {/* Left Panel: Logo & Success Rate */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
            {/* Branding */}
            <div className="flex flex-col items-center gap-2 mb-10">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-emerald-200">
                C
              </div>
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">CodeBlend</div>
            </div>

            {/* Title / Chart Header */}
            <div className="flex items-center gap-2 text-rose-500 font-bold mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
              <span>সাক্সেস রেট</span>
            </div>

            {/* Circular Progress */}
            <div className="relative w-40 h-40 flex flex-col items-center justify-center rounded-full border-[10px] border-slate-50 shadow-inner">
              {/* Dynamic ring using conic gradient */}
              <div 
                className="absolute inset-[-10px] rounded-full border-[10px] border-transparent"
                style={{
                  background: `conic-gradient(#10b981 ${successRate}%, transparent ${successRate}%) border-box`,
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }}
              />
              <div className="text-4xl font-extrabold text-emerald-500">{successRate}%</div>
              <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Success Rate</div>
            </div>
          </div>

          {/* Right Panel: Search & Stats */}
          <div className="bg-slate-50/50 flex flex-col gap-6 w-full overflow-hidden">
            
            {/* Top Bar: Search Input */}
            <div>
              <div className="bg-white rounded-2xl sm:rounded-full p-2 pl-4 sm:pl-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 shadow-sm border border-slate-100">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Mobile Number (e.g. 01712345678)" 
                  className="flex-1 bg-transparent border-none outline-none text-slate-600 placeholder-slate-400 font-medium py-3 sm:py-0 px-2 sm:px-0 text-sm sm:text-base"
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-[#ff4e00] hover:bg-[#e64600] disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-full font-bold transition-colors min-w-[120px] sm:min-w-[140px] text-sm sm:text-base"
                >
                  {loading ? "Searching..." : "রিপোর্ট দেখুন"}
                </button>
              </div>
              {error && <div className="text-rose-500 text-sm mt-2 ml-4 font-medium">{error}</div>}
            </div>

            {/* 3 Summary Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
                <div className="text-xl sm:text-3xl font-bold text-sky-500 mb-1">{stats ? stats.total_parcel : 0}</div>
                <div className="text-slate-500 text-xs sm:text-sm md:text-base font-medium">অর্ডার</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
                <div className="text-xl sm:text-3xl font-bold text-emerald-500 mb-1">{stats ? stats.success_parcel : 0}</div>
                <div className="text-slate-500 text-xs sm:text-sm md:text-base font-medium">ডেলিভারি</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 text-center">
                <div className="text-xl sm:text-3xl font-bold text-red-500 mb-1">{stats ? stats.cancelled_parcel : 0}</div>
                <div className="text-slate-500 text-xs sm:text-sm md:text-base font-medium">বাতিল</div>
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[550px]">
                  <div className="grid grid-cols-5 bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-800 text-center text-sm sm:text-base">
                    <div>কুরিয়ার</div>
                    <div>অর্ডার</div>
                    <div>ডেলিভারি</div>
                    <div>বাতিল</div>
                    <div>ডেলিভারি হার</div>
                  </div>
                  
                  {!stats ? (
                    <div className="p-16 text-center text-slate-400 text-sm">
                      কোনো তথ্য পাওয়া যায়নি
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {stats.couriers.map((courier) => {
                        const hasData = courier.order > 0;
                        return (
                          <div key={courier.name} className={`grid grid-cols-5 p-4 text-center text-sm items-center font-medium ${!hasData ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                               {courier.name}
                            </div>
                            <div className="text-slate-700">{courier.order}</div>
                            <div className="text-emerald-600">{courier.delivered}</div>
                            <div className="text-red-500">{courier.cancelled}</div>
                            <div className="text-emerald-500">{courier.rate}%</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- Bottom Section: Our Ecosystem Products & Services --- */}
        <div className="pt-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">আমাদের অন্যান্য প্রোডাক্ট ও সার্ভিসেস</h2>
            <p className="text-slate-500 font-medium">আপনার ই-কমার্স ব্যবসাকে সহজ ও স্বয়ংক্রিয় করতে আমাদের সম্পূর্ণ সুইট।</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: RevenuePro Suite */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-emerald-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-6">
                🛡️
              </div>
              <h3 className="text-xl font-bold mb-3">RevenuePro Plugin</h3>
              <p className="text-emerald-100 text-sm mb-6 flex-1">
                WooCommerce ফ্রড ডিটেকশন, অটো OTP ভেরিফিকেশন ও কুরিয়ার অটো-বুকিং প্ল্যাটফর্ম।
              </p>
              <Link href="/revenuepro" className="bg-white text-emerald-700 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-emerald-50 transition-colors inline-block text-center">
                বিস্তারিত দেখুন &rarr;
              </Link>
            </div>

            {/* Card 2: CodePay MFS Router */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-700 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-teal-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-6">
                💳
              </div>
              <h3 className="text-xl font-bold mb-3">CodePay MFS Router</h3>
              <p className="text-teal-100 text-sm mb-6 flex-1">
                পার্সোনাল bKash, Nagad ও Rocket দিয়ে ০% চার্জে পেমেন্ট গ্রহণ ও অটো ট্রানজেকশন ম্যাচিং।
              </p>
              <Link href="/codepay" className="bg-white text-teal-700 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-teal-50 transition-colors inline-block text-center">
                বিস্তারিত দেখুন &rarr;
              </Link>
            </div>

            {/* Card 3: Expense Tracker */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-700 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-indigo-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-6">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3">Expense Tracker</h3>
              <p className="text-indigo-100 text-sm mb-6 flex-1">
                MFS এসএমএস থেকে অটোমেটেড ক্যাশফ্লো লেজার, BDT/USD এনালিটিক্স ও এক্সেল রিপোর্ট।
              </p>
              <Link href="/expense-tracker" className="bg-white text-indigo-700 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-indigo-50 transition-colors inline-block text-center">
                বিস্তারিত দেখুন &rarr;
              </Link>
            </div>

            {/* Card 4: Android Companion App */}
            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-700 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-purple-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-6">
                📲
              </div>
              <h3 className="text-xl font-bold mb-3">SMS Sync Companion App</h3>
              <p className="text-purple-100 text-sm mb-6 flex-1">
                আপনার এন্ড্রয়েড ফোনের মাধ্যমে রিয়েল-টাইম MFS পেমেন্ট এসএমএস সার্ভারে সিঙ্ক করুন।
              </p>
              <Link href="/dashboard/user/payment-gateway" className="bg-white text-purple-700 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-purple-50 transition-colors inline-block text-center">
                এপ ডাউনলোড করুন &darr;
              </Link>
            </div>

            {/* Card 5: Custom Development Services */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-blue-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-6">
                🔌
              </div>
              <h3 className="text-xl font-bold mb-3">কাস্টম ডেভেলপমেন্ট সার্ভিস</h3>
              <p className="text-sky-100 text-sm mb-6 flex-1">
                কাস্টম ওয়ার্ডপ্রেস প্লাগিন, থিম, ই-কমার্স অটোমেশন ও API ইন্টিগ্রেশন সেবা।
              </p>
              <Link href="/services" className="bg-white text-sky-700 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-sky-50 transition-colors inline-block text-center">
                সার্ভিস দেখুন &rarr;
              </Link>
            </div>

            {/* Card 6: Entrepreneurs Community */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-amber-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mb-6">
                👥
              </div>
              <h3 className="text-xl font-bold mb-3">উদ্যোক্তাদের কমিউনিটি</h3>
              <p className="text-amber-100 text-sm mb-6 flex-1">
                ই-কমার্স ও উদ্যোক্তাদের জন্য গ্রোথ গাইডলাইন, ফ্রি রিসোর্স ও স্পেশাল সাপোর্ট।
              </p>
              <Link href="/pricing" className="bg-white text-amber-700 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-amber-50 transition-colors inline-block text-center">
                কমিউনিটিতে জয়েন করুন &rarr;
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
