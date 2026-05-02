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
          <div className="bg-slate-50/50 flex flex-col gap-6">
            
            {/* Top Bar: Search Input */}
            <div>
              <div className="bg-white rounded-full p-2 pl-6 flex items-center shadow-sm border border-slate-100">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Mobile Number (e.g. 01712345678)" 
                  className="flex-1 bg-transparent border-none outline-none text-slate-600 placeholder-slate-400 font-medium"
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-[#ff4e00] hover:bg-[#e64600] disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-colors min-w-[140px]"
                >
                  {loading ? "Searching..." : "রিপোর্ট দেখুন"}
                </button>
              </div>
              {error && <div className="text-rose-500 text-sm mt-2 ml-4 font-medium">{error}</div>}
            </div>

            {/* 3 Summary Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
                <div className="text-3xl font-bold text-sky-500 mb-1">{stats ? stats.total_parcel : 0}</div>
                <div className="text-slate-500 font-medium">অর্ডার</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-1">{stats ? stats.success_parcel : 0}</div>
                <div className="text-slate-500 font-medium">ডেলিভারি</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
                <div className="text-3xl font-bold text-red-500 mb-1">{stats ? stats.cancelled_parcel : 0}</div>
                <div className="text-slate-500 font-medium">বাতিল</div>
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-5 bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-800 text-center text-sm md:text-base">
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

        {/* --- Bottom Section: Other Services --- */}
        <div className="pt-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">আমাদের অন্যান্য পরিষেবা</h2>
            <p className="text-slate-500 font-medium">আপনার ব্যবসার প্রসারে আমরা আছি আপনার পাশে।</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Purple */}
            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-purple-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center p-3 mb-6">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">উদ্যোক্তাদের কমিউনিটি</h3>
              <p className="text-fuchsia-100 text-sm mb-6 flex-1">
                উদ্যোক্তাদের বিজনেস গ্রো করার জন্য অনেক ফ্রী টুল পাবেন এখানে। এছাড়া বিভিন্ন পেইড প্লাগিন ফ্রী পাবেন
              </p>
              <button className="bg-white text-purple-600 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-fuchsia-50 transition-colors">
                কমিউনিটিতে জয়েন করুন &rarr;
              </button>
            </div>

            {/* Card 2: Blue (RevenuePro App) */}
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-blue-200 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full">Featured</div>
              <div className="absolute top-8 left-6 text-white/30 text-2xl">✨</div>
              <div className="absolute bottom-12 right-6 text-white/30 text-3xl">✨</div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center p-3 mb-6 relative z-10">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">RevenuePro এ আপনার পণ্য বিক্রি করুন</h3>
              <p className="text-blue-100 text-sm mb-6 flex-1 relative z-10">
                আপনার পণ্য আমাদের সাইটে যুক্ত করে সেল করুন ২ গুনা পণ্য। বিক্রি করার দায়িত্ব আমাদের।
              </p>
              <button className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-blue-50 transition-colors relative z-10">
                বিস্তারিত দেখুন &rarr;
              </button>
            </div>

            {/* Card 3: Teal */}
            <div className="bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-teal-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center p-3 mb-6">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Courier Entry</h3>
              <p className="text-teal-100 text-sm mb-6 flex-1">
                মেসেঞ্জারে নেওয়া অর্ডার এক ক্লিকেই কুরিয়ারে এন্ট্রি করুন।
              </p>
              <button className="bg-white text-emerald-600 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-teal-50 transition-colors">
                Courier Entry &rarr;
              </button>
            </div>

            {/* Card 4: Orange */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-orange-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center p-3 mb-6">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M12.16 3h-.32L9.21 8.25h5.58zm4.3 5.25h5.16L19 3h-2.54zm-8.92 0L4.99 3H2.46l2.62 5.25zM12 22.49L3.42 9.75h17.16z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Gold Price Calculator</h3>
              <p className="text-orange-100 text-sm mb-6 flex-1">
                এক ক্লিকেই সোনার দাম হিসাব করুন।
              </p>
              <button className="bg-white text-orange-600 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-orange-50 transition-colors">
                Gold Calculator &rarr;
              </button>
            </div>

            {/* Card 5: Indigo */}
            <div className="bg-gradient-to-br from-indigo-400 to-blue-600 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-indigo-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center p-3 mb-6">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">ফ্রড চেকার ২</h3>
              <p className="text-indigo-100 text-sm mb-6 flex-1">
                সহজে এবং দ্রুত ফ্রড চেক করুন।
              </p>
              <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-indigo-50 transition-colors">
                Fraud Checker 2 &rarr;
              </button>
            </div>

            {/* Card 6: Green */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-xl shadow-green-200">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center p-3 mb-6">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">ফ্রড চেকার এপ ডাউনলোড করুন</h3>
              <p className="text-green-100 text-sm mb-6 flex-1">
                সহজে এবং দ্রুত ফ্রড চেক করুন।
              </p>
              <button className="bg-white text-green-600 px-6 py-2.5 rounded-lg font-bold text-sm w-full hover:bg-green-50 transition-colors">
                Download App
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
