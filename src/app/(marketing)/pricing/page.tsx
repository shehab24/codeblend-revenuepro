import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { LeadCTAButton } from "@/components/LeadPopup";
import { prisma } from "@/lib/prisma";
import { ShowcaseSlider } from "@/components/ShowcaseSlider";

export const metadata = {
  title: "Pricing — CodeBlend",
  description: "Simple, transparent pricing for your e-commerce growth.",
};

export default async function PricingPage() {
  const { userId } = await auth();
  const showcaseCustomers = await prisma.showcaseCustomer.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">সহজ ও স্বচ্ছ প্রাইসিং প্ল্যান</h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">আপনার ই-কমার্স ব্যবসাকে স্বয়ংক্রিয় এবং ফ্রড-মুক্ত করতে সেরা প্ল্যানটি বেছে নিন।</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Plan 1 — Monthly */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
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
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Built-in bKash পেমেন্ট (Merchant ছাড়াই)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Partial Payment (আংশিক পেমেন্ট) সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Automated Fraud Detection ও অটো ব্লকিং</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Payment Method Auto Switchার সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">IP, Email & browser ব্লকিং সিস্টেম</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Abandoned Cart Recovery ও অটো SMS</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">SMS Integration ও ওটিপি সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">সন্দেহজনক অর্ডারে Instant Warning Popup</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">এবং আরও অনেক ছোট-বড় Premium Features</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {!userId ? (
                <LeadCTAButton serviceType="Monthly Plan" className="w-full py-4 text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
              ) : (
                <Link href="/dashboard" className="w-full py-4 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all text-sm">সাবস্ক্রাইব করুন</Link>
              )}
            </div>
          </div>

          {/* Plan 2 — 6 Months */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl border-2 border-emerald-500/30 p-8 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.15)] flex flex-col justify-between relative md:-translate-y-4 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.25)] border border-emerald-400/30">
                🔥 Best Value
              </span>
            </div>
            
            <div>
              <h3 className="text-emerald-400 font-extrabold text-xl mb-2 mt-2">6 Months Plan</h3>
              <div className="mb-5 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">৳ ১,৪৯৯</span>
                <span className="text-slate-400 text-sm font-semibold">/৬ মাস</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">ব্যবসার প্রয়োজনীয় সকল অ্যাডভান্সড অটোমেশন ও সাপোর্ট।</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">Built-in bKash পেমেন্ট (Merchant ছাড়াই)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">Partial Payment (আংশিক পেমেন্ট) সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">Automated Fraud Detection ও অটো ব্লকিং</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">Payment Method Auto Switchার সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">IP, Email & browser ব্লকিং সিস্টেম</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">Abandoned Cart Recovery ও অটো SMS</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">SMS Integration ও ওটিপি সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">সন্দেহজনক অর্ডারে Instant Warning Popup</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium leading-tight">এবং আরও অনেক ছোট-বড় Premium Features</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {!userId ? (
                <LeadCTAButton serviceType="6 Months Plan" className="w-full py-4 text-center bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-[1.01] hover:brightness-105 transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
              ) : (
                <Link href="/dashboard" className="w-full py-4 block text-center bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-[1.01] hover:brightness-105 transition-all text-sm">সাবস্ক্রাইব করুন</Link>
              )}
            </div>
          </div>

          {/* Plan 3 — 1 Year */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="mb-4">
                <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Ultimate Protection</span>
              </div>
              <h3 className="text-slate-900 font-extrabold text-xl mb-2">1 Year Plan</h3>
              <div className="mb-5 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ২,৯৯৯</span>
                <span className="text-slate-400 text-sm font-semibold">/১ বছর</span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">সম্পূর্ণ ফ্রড প্রোটেকশন ও আনলিমিটেড স্কেলিং সমৃদ্ধ আলটিমেট প্ল্যান।</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Built-in bKash পেমেন্ট (Merchant ছাড়াই)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Partial Payment (আংশিক পেমেন্ট) সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Automated Fraud Detection ও অটো ব্লকিং</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Payment Method Auto Switchার সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">IP, Email & browser ব্লকিং সিস্টেম</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">Abandoned Cart Recovery ও অটো SMS</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">SMS Integration ও ওটিপি সুবিধা</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">সন্দেহজনক অর্ডারে Instant Warning Popup</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 font-medium leading-tight">এবং আরও অনেক ছোট-বড় Premium Features</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {!userId ? (
                <LeadCTAButton serviceType="1 Year Plan" className="w-full py-4 text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
              ) : (
                <Link href="/dashboard" className="w-full py-4 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all text-sm">সাবস্ক্রাইব করুন</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ CUSTOMER SHOWCASE ═══════════ */}
      {showcaseCustomers.length > 0 && (
        <div className="mt-28 border-t border-slate-200/50 pt-16 bg-slate-50/50">
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mb-10 text-center z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 mb-3 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 tracking-wider uppercase">Our Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trusted by E-commerce Leaders
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Powering operations and secure logistics for fast-growing brands.
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex items-center z-10 px-4 sm:px-8">
            {/* Fade Gradients (Left and Right overlays) */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

            {/* Showcase Slider */}
            <ShowcaseSlider customers={showcaseCustomers} />
          </div>
        </div>
      )}
    </div>
  );
}
