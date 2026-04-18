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
          <Link href="/revenuepro" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">RevenuePro</Link>
          <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Services</Link>
          <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Pricing</Link>
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
