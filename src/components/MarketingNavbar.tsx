import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { MobileMenu } from "./MobileMenu";

export async function MarketingNavbar() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
            C
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900">CodeBlend</span>
            <span className="block text-xs text-slate-400 -mt-1">Digital Solutions</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Products Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer focus:outline-none">
              Products
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-400 group-hover:text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
              <div className="w-64 bg-white rounded-2xl border border-slate-100/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-2 grid gap-1">
                <Link
                  href="/revenuepro"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50/60 transition-all group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-base shrink-0 group-hover/item:scale-105 transition-transform duration-150">
                    🛡️
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 group-hover/item:text-emerald-700 transition-colors">Revenue Pro</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">WooCommerce Fraud Blocker</span>
                  </div>
                </Link>

                <Link
                  href="/codepay"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-teal-50/60 transition-all group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100/50 flex items-center justify-center text-base shrink-0 group-hover/item:scale-105 transition-transform duration-150">
                    💳
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 group-hover/item:text-emerald-700 transition-colors">Code Pay</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">MFS Payment Gateway</span>
                  </div>
                </Link>

                <Link
                  href="/expense-tracker"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-indigo-50/60 transition-all group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-base shrink-0 group-hover/item:scale-105 transition-transform duration-150">
                    📊
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 group-hover/item:text-emerald-700 transition-colors">Expense Tracker</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Automated Cashflow Ledger</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Services</Link>
          <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Pricing</Link>
          <Link href="/fraud-check" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Fraud Check</Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!userId ? (
            <Link href="/sign-in" className="px-5 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
              Get Started →
            </Link>
          ) : (
            <Link href="/dashboard" className="px-5 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
              Dashboard →
            </Link>
          )}
        </div>

        {/* Mobile Hamburger + Slide Drawer */}
        <MobileMenu isLoggedIn={!!userId} />
      </div>
    </header>
  );
}
