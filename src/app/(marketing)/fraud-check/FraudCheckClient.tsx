"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  ChartBarIcon,
  CodeBracketSquareIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { checkFraudData } from "@/actions/fraudCheck";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localizeDigits } from "@/lib/i18n/config";
import { useLocale } from "@/components/marketing/LocaleProvider";
import { IconBadge } from "@/components/marketing/ui";

type CourierRow = {
  name: string;
  order: number;
  delivered: number;
  cancelled: number;
  rate: number;
};

type FraudStats = {
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
  couriers: CourierRow[];
};

const MORE = [
  { href: "/services", icon: CodeBracketSquareIcon, tone: "violet" as const },
  { href: "/codepay", icon: CreditCardIcon, tone: "teal" as const },
  { href: "/expense-tracker", icon: ChartBarIcon, tone: "indigo" as const },
];

export function FraudCheckClient({ t }: { t: Dictionary["fraud"] }) {
  const { locale } = useLocale();
  const n = (v: number | string) => localizeDigits(v, locale);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<FraudStats | null>(null);

  const handleSearch = async () => {
    if (!phone || phone.length < 11) {
      setError(t.invalid);
      return;
    }
    setError("");
    setLoading(true);

    // Clean up "+88" if user typed it accidentally
    const cleanPhone = phone.replace("+88", "").trim();

    try {
      const res = await checkFraudData(cleanPhone);
      if (res.success && res.data) {
        const d = res.data as any;

        // Build per-courier rows from the rich API response
        const couriers: CourierRow[] = [
          { name: "Steadfast", delivered: d.steadfast_success || 0, cancelled: d.steadfast_cancel || 0 },
          { name: "Pathao", delivered: d.pathao_success || 0, cancelled: d.pathao_cancel || 0 },
          { name: "RedX", delivered: d.redx_success || 0, cancelled: d.redx_cancel || 0 },
          { name: "ParcelDex", delivered: d.parceldex_success || 0, cancelled: d.parceldex_cancel || 0 },
          { name: "PaperFly", delivered: d.paperfly_success || 0, cancelled: d.paperfly_cancel || 0 },
          { name: "CarryBee", delivered: d.carrybee_success || 0, cancelled: d.carrybee_cancel || 0 },
        ].map(c => ({
          ...c,
          order: c.delivered + c.cancelled,
          rate: (c.delivered + c.cancelled) > 0 ? Math.round((c.delivered / (c.delivered + c.cancelled)) * 100) : 0
        }));

        setStats({
          total_parcel: d.total_parcel || 0,
          success_parcel: d.success_parcel || 0,
          cancelled_parcel: d.cancelled_parcel || 0,
          success_ratio: d.success_ratio || 0,
          couriers
        });
      } else {
        setError(res.error || t.failed);
      }
    } catch (e: any) {
      setError(t.unexpected);
    } finally {
      setLoading(false);
    }
  };

  const successRate = stats ? Math.round(stats.success_ratio) : 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl space-y-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">{t.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_2.5fr]">
          {/* Success rate */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500">{t.successRate}</span>
            <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full border-[10px] border-slate-50 shadow-inner">
              <div
                className="absolute inset-[-10px] rounded-full border-[10px] border-transparent"
                style={{
                  background: `conic-gradient(#10b981 ${successRate}%, transparent ${successRate}%) border-box`,
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude'
                }}
              />
              <div className="text-4xl font-extrabold text-emerald-500">{n(successRate)}%</div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-6 overflow-hidden">
            <div>
              <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-sm sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:pl-6">
                <MagnifyingGlassIcon className="hidden h-5 w-5 text-slate-400 sm:block" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t.placeholder}
                  className="flex-1 border-none bg-transparent px-2 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 sm:px-3 sm:py-0 sm:text-base"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="min-w-[140px] rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-full sm:px-8 sm:text-base cursor-pointer"
                >
                  {loading ? t.searching : t.search}
                </button>
              </div>
              {error && <div className="ml-4 mt-2 text-sm font-medium text-rose-500">{error}</div>}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {[
                { label: t.orders, value: stats?.total_parcel ?? 0, color: "text-sky-500" },
                { label: t.delivered, value: stats?.success_parcel ?? 0, color: "text-emerald-500" },
                { label: t.cancelled, value: stats?.cancelled_parcel ?? 0, color: "text-rose-500" },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm sm:p-6">
                  <div className={`mb-1 text-xl font-bold sm:text-3xl ${card.color}`}>{n(card.value)}</div>
                  <div className="text-xs font-medium text-slate-500 sm:text-sm">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[550px]">
                  <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50 p-4 text-center text-sm font-bold text-slate-800">
                    <div>{t.courier}</div>
                    <div>{t.orders}</div>
                    <div>{t.delivered}</div>
                    <div>{t.cancelled}</div>
                    <div>{t.rate}</div>
                  </div>
                  {!stats ? (
                    <div className="p-16 text-center text-sm text-slate-400">{t.empty}</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {stats.couriers.map((courier) => {
                        const hasData = courier.order > 0;
                        return (
                          <div key={courier.name} className={`grid grid-cols-5 items-center p-4 text-center text-sm font-medium ${!hasData ? "opacity-60" : ""}`}>
                            <div className="flex items-center justify-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${hasData ? "bg-emerald-500" : "bg-slate-300"}`} />
                              {courier.name}
                            </div>
                            <div className="text-slate-700">{n(courier.order)}</div>
                            <div className="text-emerald-600">{n(courier.delivered)}</div>
                            <div className="text-rose-500">{n(courier.cancelled)}</div>
                            <div className="text-emerald-500">{n(courier.rate)}%</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RevenuePro upsell */}
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <ShieldCheckIcon className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold sm:text-2xl">{t.upsell.title}</h2>
            <p className="mt-1 text-sm text-emerald-50">{t.upsell.desc}</p>
          </div>
          <Link href="/revenuepro" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            {t.upsell.cta}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900">{t.more.title}</h2>
            <p className="mt-2 text-slate-600">{t.more.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {t.more.items.map((item, i) => {
              const { href, icon: Icon, tone } = MORE[i];
              return (
                <Link key={item.title} href={href} className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-lg">
                  <IconBadge tone={tone}><Icon className="h-5 w-5" /></IconBadge>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{item.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    {item.cta}
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
