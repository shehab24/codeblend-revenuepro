import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { LeadCTAButton } from "@/components/LeadPopup";

export const metadata = {
  title: "Pricing — CodeBlend",
  description: "Simple, transparent pricing for your e-commerce growth.",
};

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Choose the perfect plan to grow your business.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 — Monthly */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
            <h3 className="text-slate-500 font-bold mb-4">Monthly</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">৳ 999</span>
              <span className="text-slate-400 text-sm"> / mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Perfect for new businesses just getting started.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Unlimited API queries</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Basic fraud prevention</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Standard dashboard</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Email support</li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="Monthly Plan" className="w-full py-3 block text-center bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors cursor-pointer">Get Started</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3 block text-center bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors">Subscribe Now</Link>
            )}
          </div>

          {/* Plan 2 — Quarterly */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
            </div>
            <h3 className="text-emerald-400 font-bold mb-4">Quarterly</h3>
            <div className="mb-6">
               <span className="text-4xl font-extrabold text-white">৳ 2,500</span>
               <span className="text-slate-400 text-sm"> / 3 mo</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Save ৳500 — everything you need to automate your store.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Unlimited API queries</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Advanced fraud analytics</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Priority email support</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Custom integrations</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Dedicated onboarding</li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="Quarterly Plan" className="w-full py-3 block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer">Get Quarterly Plan</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3 block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">Subscribe Now</Link>
            )}
          </div>

          {/* Plan 3 */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
            <h3 className="text-slate-500 font-bold mb-4">Enterprise</h3>
            <div className="mb-6"><span className="text-4xl font-extrabold text-slate-900">Custom</span></div>
            <p className="text-slate-500 text-sm mb-8">For large-scale operations and agencies.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Dedicated account manager</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Custom feature development</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> SLA & 24/7 Phone Support</li>
            </ul>
            <a href="https://wa.me/+8801XXXXXXXXX" className="w-full py-3 block text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Contact Sales</a>
          </div>
        </div>
      </div>
    </div>
  );
}
