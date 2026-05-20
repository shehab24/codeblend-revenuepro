"use client";

import { useState } from "react";

export function MaskedLicenseKey({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);

  const maskedKey = licenseKey.slice(0, 7) + "••••••••••••••••••••••••••";

  return (
    <div className="flex items-center gap-2">
      <code className="text-emerald-600 break-all text-sm font-mono flex-1 bg-emerald-50 px-3 py-2 rounded-lg">
        {revealed ? licenseKey : maskedKey}
      </code>
      <button
        onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }}
        className="shrink-0 w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
        title={revealed ? "Hide Key" : "Reveal Key"}
      >
        {revealed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.879L21 21" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(licenseKey); }}
        className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors text-xs font-bold"
        title="Copy Key"
      >
        📋 Copy
      </button>
    </div>
  );
}
