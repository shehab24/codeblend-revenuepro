import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE: Marketing Banner */}
      <div className="hidden md:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              C
            </div>
            <div className="text-left">
              <div className="text-2xl font-extrabold text-white leading-none tracking-tight">CodeBlend</div>
              <div className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-1">Digital Solutions</div>
            </div>
          </Link>
          <div className="mt-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4 uppercase tracking-widest">
              RevenuePro Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Stop fraud.<br />
              <span className="text-slate-400">Scale faster.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              Join the elite merchants using our intelligence platform to automate operations and protect their profit margins.
            </p>
          </div>
        </div>

        {/* Social Proof / Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <div>
            <div className="text-2xl font-extrabold text-white mb-1">50+</div>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Happy Clients</div>
          </div>
          <div>
             <div className="text-2xl font-extrabold text-white mb-1">1M+</div>
             <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Orders Secured</div>
          </div>
        </div>

        {/* Testimonial / Footnote */}
        <div className="relative z-10 mt-auto pt-12">
          <div className="flex gap-1 text-emerald-400 mb-2 text-sm">
             ★★★★★
          </div>
          <p className="text-slate-300 text-sm font-medium italic max-w-sm">
            "RevenuePro single-handedly reduced our fake orders by 94% in the first two weeks."
          </p>
          <div className="text-slate-500 text-xs mt-3 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-slate-700"></span> Leading E-commerce Brand
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form (Mobile handles logo here too if needed) */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 relative bg-white">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
              C
            </div>
            <div className="text-left">
              <div className="text-xl font-extrabold text-slate-900 leading-none">CodeBlend</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Digital Solutions</div>
            </div>
          </Link>
        </div>

        {/* The Actual Next.js Page children (SignIn / SignUp components) */}
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
