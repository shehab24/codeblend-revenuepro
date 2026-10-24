"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";
import { useLocale } from "./LocaleProvider";

const OPTIONS: { value: Locale; short: string; symbol: string }[] = [
  { value: "en", short: "EN", symbol: "$" },
  { value: "bn", short: "বাং", symbol: "৳" },
];

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const { locale, common } = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="radiogroup"
      aria-label={common.switcher.label}
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-sm ${pending ? "opacity-60" : ""} ${className}`}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={common.switcher[opt.value]}
            disabled={pending}
            onClick={() => {
              if (!active) startTransition(() => setLocale(opt.value));
            }}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-colors cursor-pointer ${
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className={active ? "text-emerald-300" : "text-slate-400"}>{opt.symbol}</span>
            {opt.short}
          </button>
        );
      })}
    </div>
  );
}
