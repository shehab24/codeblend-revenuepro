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
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Choose the perfect plan to grow your business.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 — Monthly */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
            <h3 className="text-slate-500 font-bold mb-4">Monthly</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">৳ 499</span>
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

          {/* Plan 2 — Bi-Monthly */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
            </div>
            <h3 className="text-emerald-400 font-bold mb-4">Bi-Monthly</h3>
            <div className="mb-6">
               <span className="text-4xl font-extrabold text-white">৳ 999</span>
               <span className="text-slate-400 text-sm"> / 2 mo</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Everything you need to automate your store.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Unlimited API queries</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Advanced fraud analytics</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Priority email support</li>
              <li className="flex items-center gap-3 text-slate-300 text-sm"><span className="text-emerald-500">✓</span> Custom integrations</li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="Monthly Plan" className="w-full py-3 block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer">Get Started</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3 block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">Subscribe Now</Link>
            )}
          </div>

          {/* Plan 3 — Quarterly */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
            <h3 className="text-slate-500 font-bold mb-4">Quarterly</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">৳ 1,499</span>
              <span className="text-slate-400 text-sm"> / 3 mo</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Premium power for serious e-commerce builders.</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Unlimited API queries</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Advanced fraud analytics</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Priority email support</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Custom integrations</li>
              <li className="flex items-center gap-3 text-slate-600 text-sm"><span className="text-emerald-500">✓</span> Dedicated onboarding</li>
            </ul>
            {!userId ? (
              <LeadCTAButton serviceType="Quarterly Plan" className="w-full py-3 block text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer">Get Started</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full py-3 block text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Subscribe Now</Link>
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
