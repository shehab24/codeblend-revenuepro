"use client";

import { useState } from "react";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const PRESETS = ["#0d9488", "#e2125a", "#f35923", "#4f46e5"];

export function BrandCustomizer({ t }: { t: Dictionary["codepay"]["customizer"] }) {
  const [color, setColor] = useState(PRESETS[0]);
  const [brandName, setBrandName] = useState("");
  const shownName = brandName || t.defaultBrand;

  return (
    <div className="flex flex-col items-center gap-12 rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_60px_-24px_rgb(15_23_42/0.15)] sm:p-10 lg:flex-row">
      <div className="w-full flex-1 space-y-8">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{t.brandName}</span>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            maxLength={20}
            placeholder={t.brandPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
          />
        </label>

        <div className="space-y-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">{t.presets}</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((val, i) => (
              <button
                key={val}
                onClick={() => setColor(val)}
                className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors hover:bg-slate-50 cursor-pointer"
                style={{ borderColor: color === val ? val : "#e2e8f0", color: color === val ? val : "#475569" }}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: val }} />
                {t.colors[i]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-medium text-slate-500">{t.custom}</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200 p-0"
            />
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700">{color}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5 text-sm leading-relaxed text-slate-600">
          <span className="mb-1 flex items-center gap-1.5 font-bold text-slate-800">
            <LightBulbIcon className="h-4 w-4 text-teal-600" />
            {t.policyTitle}
          </span>
          {t.policy}
        </div>
      </div>

      {/* Phone mock */}
      <div
        style={{ borderColor: color }}
        className="relative mx-auto w-full max-w-sm rounded-[36px] border-4 bg-slate-100 p-5 shadow-inner transition-colors duration-300 lg:w-96"
      >
        <div style={{ backgroundColor: color }} className="absolute left-1/2 top-7 z-10 h-4 w-20 -translate-x-1/2 rounded-full opacity-70" />
        <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-white pt-4 text-xs shadow-lg">
          <div style={{ backgroundColor: color }} className="flex items-center justify-between p-4 text-white transition-colors duration-300">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {shownName.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold tracking-tight">{shownName}</span>
            </div>
            <span className="text-[10px] font-semibold opacity-80">{t.paySafe}</span>
          </div>
          <div className="flex-1 space-y-4 p-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">{t.amountDue}</span>
              <span className="text-xl font-black text-slate-800">{t.amount}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] font-bold uppercase text-slate-400">{t.sendTo}</span>
              <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2 font-mono text-[11px]">
                <span className="font-bold text-slate-800">017XXXXXXXX</span>
                <span className="text-[10px] font-bold text-slate-400">{t.copy}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] font-bold uppercase text-slate-400">{t.trx}</span>
              <input type="text" disabled placeholder="e.g. BLA8912389" className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs" />
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-4">
            <button style={{ backgroundColor: color }} className="w-full rounded-lg py-2 text-xs font-bold text-white">
              {t.verify}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
