"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { ProductKey } from "@/lib/pricing";
import { PlanGrid, UsdNote } from "@/components/marketing/PlanCard";
import { SectionHeading, PRODUCT_TONE } from "@/components/marketing/ui";
import { PRODUCT_ICONS, PRODUCT_KEYS } from "@/components/marketing/icons";
import { LocaleSwitcher } from "@/components/marketing/LocaleSwitcher";

export function PricingSectionWithTabs({
  t,
  locale,
  isLoggedIn,
  as = "h2",
}: {
  t: Dictionary["pricing"];
  locale: Locale;
  isLoggedIn: boolean;
  as?: "h1" | "h2";
}) {
  const [activeTab, setActiveTab] = useState<ProductKey>("revenuepro");

  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden bg-slate-50/70 py-24 md:py-32">
      <div className="cb-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} tone={PRODUCT_TONE[activeTab]} as={as} />

        <div className="mb-14 flex flex-col items-center gap-4">
          <div role="tablist" className="flex flex-wrap justify-center gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200 shadow-sm">
            {PRODUCT_KEYS.map((key) => {
              const Icon = PRODUCT_ICONS[key];
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.tabs[key]}
                </button>
              );
            })}
          </div>
          <LocaleSwitcher />
        </div>

        <PlanGrid product={activeTab} t={t} locale={locale} isLoggedIn={isLoggedIn} />
        <UsdNote t={t} locale={locale} />

        <p className="mt-6 text-center text-sm text-slate-600">
          {t.servicesNote}{" "}
          <Link href="/services" className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-950">
            {t.servicesLink} →
          </Link>
        </p>
      </div>
    </section>
  );
}
