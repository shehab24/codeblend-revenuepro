import React from "react";
import Link from "next/link";

interface AccessRestrictedProps {
  featureName: string;
  description?: string;
}

export function AccessRestricted({
  featureName,
  description = "Access to this feature has been restricted by the administrator. Please upgrade your plan or contact support to enable this service.",
}: AccessRestrictedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="relative mb-6">
        {/* Glow behind the icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-20 scale-150 animate-pulse" />
        
        {/* Lock Icon Container */}
        <div className="relative w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center shadow-lg text-slate-400">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>

      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase border border-emerald-100 mb-3">
        PREMIUM FEATURE
      </span>
      
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
        Unlock {featureName}
      </h2>
      
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none justify-center">
        <Link
          href="/dashboard/user/requests"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-slate-800 transition text-center shadow-sm cursor-pointer"
        >
          Contact Support to Upgrade
        </Link>
        <Link
          href="/dashboard/user"
          className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-extrabold text-xs tracking-wider uppercase hover:bg-slate-50 transition text-center cursor-pointer"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
