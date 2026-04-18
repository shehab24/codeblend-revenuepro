import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { LeadCTAButton } from "@/components/LeadPopup";

export const metadata = {
  title: "RevenuePro — CodeBlend",
  description: "The ultimate courier intelligence and fraud prevention platform for WooCommerce.",
};

export default async function RevenueProPage() {
  const { userId } = await auth();

  return (
    <div className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
            <span className="text-emerald-500 text-sm">🛡️</span>
            <span className="text-sm font-medium text-emerald-600">Our Flagship Product</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6">
            RevenuePro<br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Intelligence Platform</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Real-time courier fraud prevention, advanced analytics, and seamless WooCommerce integration to protect your profit margins.
          </p>

          <div className="flex justify-center gap-4">
            {!userId ? (
              <LeadCTAButton serviceType="RevenuePro" className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-base font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200">Get RevenuePro Now</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-base font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200">
                Go to Dashboard
              </Link>
            )}
            <Link href="/pricing" className="px-8 py-4 bg-white text-slate-700 rounded-2xl text-base font-bold border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
              View Pricing
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-24 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Block fake orders before they happen</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              RevenuePro integrates directly with BD Courier databases (Pathao, Steadfast, RedX, etc.) to verify every phone number at checkout. It dynamically checks historical delivery ratios and blocks serial returners from draining your ad budget.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
                <span className="text-slate-700">Access to 6 major courier databases</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
                <span className="text-slate-700">30-day smart caching system</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
                <span className="text-slate-700">Live API lookups and verification</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
             <h3 className="text-white font-mono text-xl mb-4 border-b border-slate-700 pb-4">Live Telemetry Data</h3>
             <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between text-slate-400"><span>Target:</span> <span className="text-emerald-400">017XXXXXXXX</span></div>
                <div className="flex justify-between text-slate-400"><span>Status:</span> <span className="text-emerald-400">Safe (89% Success)</span></div>
                <div className="flex justify-between text-slate-400"><span>Total Parcels:</span> <span className="text-white">124</span></div>
                <div className="flex justify-between text-slate-400"><span>Returned:</span> <span className="text-red-400">14</span></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
