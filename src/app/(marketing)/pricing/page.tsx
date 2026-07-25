import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ShowcaseSlider } from "@/components/ShowcaseSlider";
import { PricingSectionWithTabs } from "@/components/PricingSectionWithTabs";

export const metadata = {
  title: "Pricing — CodeBlend",
  description: "Simple, transparent pricing for RevenuePro, CodePay, and Expense Tracker.",
};

export default async function PricingPage() {
  const { userId } = await auth();
  const showcaseCustomers = await prisma.showcaseCustomer.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Tabbed Pricing Section for RevenuePro, CodePay & Expense Tracker */}
      <PricingSectionWithTabs userId={userId} />

      {/* ═══════════ CUSTOMER SHOWCASE ═══════════ */}
      {showcaseCustomers.length > 0 && (
        <div className="py-16 border-t border-slate-200/50 bg-slate-50/50">
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
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <ShowcaseSlider customers={showcaseCustomers} />
          </div>
        </div>
      )}
    </div>
  );
}
