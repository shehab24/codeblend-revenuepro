import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { ArrowDownTrayIcon, ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FeatureRow, ProductHero, ProductPricingSection } from "@/components/marketing/ProductSections";
import { Container, IconBadge, Section, SectionHeading } from "@/components/marketing/ui";
import { getI18n } from "@/lib/i18n/server";
import { CashflowChart, DashboardShots } from "./ExpenseWidgets";

export const metadata: Metadata = {
  title: "Expense Tracker — Automated Cashflow Ledger | CodeBlend",
  description: "Turn bKash, Nagad and Rocket SMS into a live cashflow dashboard with BDT/USD views and exports.",
};

const TOOL_ICONS = [ClockIcon, MagnifyingGlassIcon, ArrowDownTrayIcon];
const MOBILE_SHOTS = ["/expense-mobile-main-v3.png", "/expense-mobile-add-v3.png", "/expense-mobile-activity-v3.png"];

export default async function ExpenseTrackerPage() {
  const { userId } = await auth();
  const { locale, t } = await getI18n();
  const e = t.expense;

  return (
    <div className="overflow-x-hidden bg-white">
      <ProductHero
        product="expense"
        badge={e.hero.badge}
        title={e.hero.title}
        highlight={e.hero.highlight}
        subtitle={e.hero.subtitle}
        primary={e.hero.primary}
        dashboardLabel={e.hero.dashboard}
        secondary={e.hero.secondary}
        isLoggedIn={!!userId}
        leadService="Expense Tracker"
        visual={<CashflowChart t={e.chart} />}
      />

      <Section muted>
        <Container>
          <SectionHeading title={e.tools.title} subtitle={e.tools.subtitle} tone="indigo" />
          <div className="grid gap-px overflow-hidden rounded-3xl bg-slate-200 ring-1 ring-slate-200 md:grid-cols-3">
            {e.tools.items.map((item, i) => {
              const Icon = TOOL_ICONS[i];
              return (
                <div key={item.title} className="cb-reveal bg-white p-8">
                  <IconBadge tone="indigo"><Icon className="h-5 w-5" /></IconBadge>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      <Container className="space-y-28 py-24 md:space-y-36 md:py-32">
        <FeatureRow tag={e.web.tag} title={e.web.title} desc={e.web.desc} points={e.web.points} tone="indigo">
          <DashboardShots tabs={e.web.tabs} />
        </FeatureRow>

        <FeatureRow tag={e.mobile.tag} title={e.mobile.title} desc={e.mobile.desc} points={e.mobile.points} tone="indigo" reverse>
          <div className="mx-auto grid w-full max-w-lg grid-cols-3 items-start gap-4">
            {MOBILE_SHOTS.map((src, i) => (
              <div key={src} className="space-y-1.5 text-center transition-transform duration-300 hover:scale-[1.02]">
                <span className="block text-[10px] font-bold uppercase text-slate-400">{e.mobile.screens[i]}</span>
                <Image src={src} alt={e.mobile.screens[i]} width={865} height={539} className="h-auto w-full object-contain" unoptimized />
              </div>
            ))}
          </div>
        </FeatureRow>
      </Container>

      <ProductPricingSection
        product="expense"
        title={e.pricing.title}
        subtitle={e.pricing.subtitle}
        t={t.pricing}
        locale={locale}
        isLoggedIn={!!userId}
      />
    </div>
  );
}
