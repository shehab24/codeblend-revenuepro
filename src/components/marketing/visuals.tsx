import {
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { BrowserFrame } from "./ui";

// Illustrative UI mocks for each service. Pure markup, translated via the dictionary.

type Visuals = Dictionary["serviceDetail"];

function Toggle() {
  return (
    <span className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-emerald-500">
      <span className="absolute right-0.5 h-3 w-3 rounded-full bg-white shadow" />
    </span>
  );
}

export function WordPressVisual({ v, compact = false }: { v: Visuals["wordpress"]["visual"]; compact?: boolean }) {
  return (
    <BrowserFrame url={v.url}>
      <div className="flex">
        {!compact && (
          <div className="hidden w-28 shrink-0 space-y-2 bg-slate-900 p-3 sm:block">
            <span className="mb-3 block h-5 w-5 rounded-full bg-sky-500/80" />
            {[60, 80, 50, 70, 55].map((w, i) => (
              <span key={i} style={{ width: `${w}%` }} className={`block h-1.5 rounded-full ${i === 1 ? "bg-sky-400" : "bg-white/15"}`} />
            ))}
          </div>
        )}
        <div className="flex-1 space-y-3 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">{v.plugin}</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">{v.active}</span>
          </div>
          <div className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200">
            {v.toggles.map((label) => (
              <div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="truncate text-[11px] text-slate-600">{label}</span>
                <Toggle />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <span className="block text-[10px] text-slate-400">{v.speed}</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[conic-gradient(#10b981_98%,#e2e8f0_0)]">
                  <span className="absolute inset-[3px] rounded-full bg-white" />
                  <span className="relative text-[10px] font-bold text-emerald-600">{v.score}</span>
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <span className="block text-[10px] text-slate-400">{v.orders}</span>
              <span className="mt-1 block text-lg font-semibold text-slate-900">{v.ordersValue}</span>
              <div className="mt-1 flex h-5 items-end gap-0.5">
                {[30, 45, 35, 60, 50, 75, 90].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} className="flex-1 rounded-sm bg-sky-400/70" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AIVisual({ v }: { v: Visuals["ai"]["visual"] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10 shadow-[0_24px_60px_-20px_rgb(15_23_42/0.45)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
          <SparklesIcon className="h-4 w-4" />
        </span>
        <div>
          <span className="block text-xs font-semibold text-white">{v.agent}</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {v.online}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4 text-[12px] leading-snug">
        <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-white/10 px-3 py-2 text-slate-200">{v.q1}</p>
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-violet-500/90 px-3 py-2 text-white">{v.a1}</p>
        <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-white/10 px-3 py-2 text-slate-200">{v.q2}</p>
        <p className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/20">
          <CheckCircleIcon className="h-3.5 w-3.5" /> {v.action}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 bg-white/[0.02] px-4 py-3">
        {v.flow.map((step, i) => (
          <span key={step} className="flex items-center gap-1.5">
            <span className={`rounded-md px-2 py-1 text-[10px] font-medium ${i === 1 ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/30" : "bg-white/5 text-slate-400"}`}>
              {step}
            </span>
            {i < v.flow.length - 1 && <ArrowRightIcon className="h-3 w-3 text-slate-600" />}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShopifyVisual({ v }: { v: Visuals["shopify"]["visual"] }) {
  return (
    <BrowserFrame url={v.url}>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{v.collection}</span>
          <span className="flex items-center gap-1 rounded-full bg-lime-50 px-2 py-0.5 text-[10px] font-semibold text-lime-800 ring-1 ring-lime-200">
            <BoltIcon className="h-3 w-3" /> {v.badge}
          </span>
        </div>
        <div className="grid grid-cols-[1.1fr_1fr] gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-stone-100 via-amber-50 to-lime-100">
            <div className="absolute inset-x-6 bottom-0 h-3 rounded-full bg-stone-400/20 blur-md" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[78%] w-[78%] drop-shadow-sm" aria-hidden="true">
              <path d="M30 22 L42 15 Q50 21 58 15 L70 22 L87 37 L78 47 L70 41 L70 88 L30 88 L30 41 L22 47 L13 37 Z" fill="#e9dfcd" stroke="#bfae92" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M42 15 L50 29 L58 15" fill="none" stroke="#bfae92" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M50 29 L50 88" stroke="#bfae92" strokeWidth="1" />
              <rect x="34" y="42" width="10" height="9" rx="1.5" fill="none" stroke="#bfae92" strokeWidth="1" />
              {[40, 52, 64, 76].map((y) => (
                <circle key={y} cx="50" cy={y} r="1.3" fill="#8f7d60" />
              ))}
            </svg>
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-slate-700 shadow-sm">NEW</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{v.product}</span>
            <span className="mt-1 text-sm text-slate-500">{v.price}</span>
            <div className="mt-3 flex gap-1.5">
              {["bg-stone-300", "bg-slate-800", "bg-lime-700"].map((c) => (
                <span key={c} className={`h-4 w-4 rounded-full ring-2 ring-white ${c} shadow`} />
              ))}
            </div>
            <span className="mt-auto rounded-lg bg-slate-950 py-2 text-center text-[11px] font-semibold text-white">{v.add}</span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
          <span className="text-[10px] font-medium text-slate-500">{v.pay}</span>
          <span className="flex gap-1">
            {v.methods.map((m, i) => (
              <span
                key={m}
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  i === 0 ? "bg-[#e2125a] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {m}
              </span>
            ))}
          </span>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function ServiceVisual({ pillar, t }: { pillar: "wordpress" | "ai" | "shopify"; t: Visuals }) {
  if (pillar === "wordpress") return <WordPressVisual v={t.wordpress.visual} />;
  if (pillar === "ai") return <AIVisual v={t.ai.visual} />;
  return <ShopifyVisual v={t.shopify.visual} />;
}
