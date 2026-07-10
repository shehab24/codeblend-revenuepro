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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 — Monthly */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
            <h3 className="text-slate-500 font-bold mb-4 text-lg">Monthly Plan</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">৳ ২৪৯</span>
              <span className="text-slate-400 text-sm"> / মাস</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">নতুন স্টার্টআপ ও ছোট ই-কমার্স ব্যবসার জন্য সেরা শুরু।</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>Built-in bKash পেমেন্ট (মার্চেন্ট অ্যাকাউন্ট ছাড়াই)</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>অটোমেটেড কুরিয়ার ডেসপাচ ও অর্ডার স্ট্যাটাস আপডেট</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>কুইক COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>পিক্সেল, কনভার্সন API, UTM ট্র্যাকিং ও Google Analytics</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>এসএমএস (SMS) ও ইমেইল ইন্টিগ্রেশন সুবিধা</span></li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="Monthly Plan" className="w-full py-3.5 block text-center bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3.5 block text-center bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors text-sm">সাবস্ক্রাইব করুন</Link>
            )}
          </div>

          {/* Plan 2 — 6 Months */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl flex flex-col relative transform md:-translate-y-4 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider shadow-lg">BEST VALUE</span>
            </div>
            <h3 className="text-emerald-400 font-bold mb-4 text-lg">6 Months Plan</h3>
            <div className="mb-6">
               <span className="text-4xl font-extrabold text-white">৳ ১,৪৯৯</span>
               <span className="text-slate-400 text-sm"> / ৬ মাস</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">দ্রুত বর্ধনশীল ব্যবসার জন্য প্রয়োজনীয় সকল অ্যাডভান্সড ফিচার ও অটোমেশন।</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-emerald-400 text-sm font-semibold"><span className="text-emerald-400 font-bold">★</span> <span>Monthly প্ল্যানের সকল সুবিধা</span></li>
              <li className="flex items-start gap-3 text-slate-300 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>আংশিক পেমেন্ট (Partial Payment Method) সুবিধা</span></li>
              <li className="flex items-start gap-3 text-slate-300 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>OTP দিয়ে গ্রাহকের মোবাইল নম্বর ভেরিফিকেশন</span></li>
              <li className="flex items-start gap-3 text-slate-300 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>অ্যাবানডনড কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট</span></li>
              <li className="flex items-start gap-3 text-slate-300 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>সন্দেহজনক অর্ডারে ইনস্ট্যান্ট Warning Popup</span></li>
              <li className="flex items-start gap-3 text-slate-300 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>প্রাইওরিটি ইমেইল ও লাইভ চ্যাট সাপোর্ট</span></li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="6 Months Plan" className="w-full py-3.5 block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-95 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3.5 block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-95 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-sm">সাবস্ক্রাইব করুন</Link>
            )}
          </div>

          {/* Plan 3 — 1 Year */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
            <h3 className="text-slate-500 font-bold mb-4 text-lg">1 Year Plan</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">৳ ২,৯৯৯</span>
              <span className="text-slate-400 text-sm"> / ১ বছর</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">সম্পূর্ণ ফ্রড প্রোটেকশন ও আনলিমিটেড স্কেলিং সমৃদ্ধ আলটিমেট প্ল্যান।</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-emerald-600 text-sm font-semibold"><span className="text-emerald-500 font-bold">★</span> <span>6 Months প্ল্যানের সকল সুবিধা</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>অটোমেটেড ফ্রড ডিটেকশন ও ব্লকিং সিস্টেম</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>ফ্রড ডিটেক্ট হলেই পেমেন্ট মেথড অটো সুইচ</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>IP, Email, Phone ও ব্রাউজার ফিঙ্গারপ্রিন্ট ব্লকিং</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>ডেডিকেটেড ভিআইপি অনবোর্ডিং ও সাপোর্ট ম্যানেজার</span></li>
              <li className="flex items-start gap-3 text-slate-600 text-sm"><span className="text-emerald-500 font-bold">✓</span> <span>লাইফটাইম সকল নতুন প্রিমিয়াম আপডেট ফ্রি</span></li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="1 Year Plan" className="w-full py-3.5 block text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3.5 block text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm">সাবস্ক্রাইব করুন</Link>
            )}
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
