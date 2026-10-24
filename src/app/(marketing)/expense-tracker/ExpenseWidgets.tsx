"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LOCALE_CURRENCY, toBanglaDigits } from "@/lib/i18n/config";
import { USD_BDT_RATE } from "@/lib/pricing";
import { useLocale } from "@/components/marketing/LocaleProvider";

const WEEKLY = [
  [12000, 4000], [8000, 2500], [15000, 6000], [9500, 3000], [18000, 5500], [11000, 2000], [14000, 4500],
];
const MONTHLY = [
  [52000, 18000], [48000, 12000], [65000, 22000], [59000, 15000],
];

export function CashflowChart({ t }: { t: Dictionary["expense"]["chart"] }) {
  const { locale } = useLocale();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [currency, setCurrency] = useState<"BDT" | "USD">(LOCALE_CURRENCY[locale]);

  const data = period === "weekly" ? WEEKLY : MONTHLY;
  const labels = period === "weekly" ? t.weekLabels : t.monthLabels;
  const maxVal = period === "weekly" ? 20000 : 80000;

  const formatMoney = (bdt: number) => {
    if (currency === "USD") return `$${Math.round(bdt / USD_BDT_RATE).toLocaleString("en-US")}`;
    const n = bdt.toLocaleString("en-US");
    return `৳${locale === "bn" ? toBanglaDigits(n) : n}`;
  };

  const seg = (active: boolean) =>
    `rounded-md px-2.5 py-1 transition-colors cursor-pointer ${active ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`;

  return (
    <div className="mx-auto w-full rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_30px_80px_-30px_rgb(15_23_42/0.35)] sm:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 text-left sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.eyebrow}</span>
          <p className="mt-0.5 text-lg font-semibold text-slate-900">{t.title}</p>
        </div>
        <div className="flex gap-2 text-[11px] font-bold">
          <div className="flex rounded-lg border border-slate-200/60 bg-slate-100 p-0.5">
            <button onClick={() => setPeriod("weekly")} className={seg(period === "weekly")}>{t.weekly}</button>
            <button onClick={() => setPeriod("monthly")} className={seg(period === "monthly")}>{t.monthly}</button>
          </div>
          <div className="flex rounded-lg border border-slate-200/60 bg-slate-100 p-0.5">
            <button onClick={() => setCurrency("BDT")} className={seg(currency === "BDT")}>৳ BDT</button>
            <button onClick={() => setCurrency("USD")} className={seg(currency === "USD")}>$ USD</button>
          </div>
        </div>
      </div>

      <div className="flex h-56 items-end justify-between gap-2 border-b border-slate-100 pb-2 sm:gap-4">
        {data.map(([inflow, outflow], i) => (
          <div key={labels[i]} className="group relative flex h-full flex-1 flex-col items-center justify-end">
            <div className="pointer-events-none absolute -top-12 z-10 min-w-[80px] rounded-md bg-slate-900 px-2 py-1 text-center text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block text-emerald-400">{t.in}: {formatMoney(inflow)}</span>
              <span className="block text-rose-400">{t.out}: {formatMoney(outflow)}</span>
            </div>
            <div className="flex h-full w-full items-end gap-1">
              <div style={{ height: `${(inflow / maxVal) * 100}%` }} className="min-h-[4px] flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-300" />
              <div style={{ height: `${(outflow / maxVal) * 100}%` }} className="min-h-[4px] flex-1 rounded-t-sm bg-gradient-to-t from-rose-500 to-red-400 transition-all duration-300" />
            </div>
            <span className="mt-2 text-[10px] font-bold text-slate-400">{labels[i]}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-emerald-500 to-teal-400" />{t.inflow}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-rose-500 to-red-400" />{t.outflow}</span>
      </div>
    </div>
  );
}

export function DashboardShots({ tabs }: { tabs: string[] }) {
  const { locale } = useLocale();
  const [tab, setTab] = useState<"bdt" | "usd">(locale === "bn" ? "bdt" : "usd");

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(["bdt", "usd"] as const).map((key, i) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === key ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tabs[i]}
          </button>
        ))}
      </div>
      <Image
        src={tab === "bdt" ? "/expense-dashboard-bdt-v3.png" : "/expense-dashboard-usd-v3.png"}
        alt={`Expense Tracker web dashboard (${tab.toUpperCase()})`}
        width={865}
        height={481}
        className="h-auto w-full object-contain"
        unoptimized
      />
    </div>
  );
}
