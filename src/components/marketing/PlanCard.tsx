import Link from "next/link";
import { LeadCTAButton } from "@/components/LeadPopup";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatPrice, PRODUCT_PLANS, type Plan, type ProductKey } from "@/lib/pricing";
import { BTN, CARD, CheckList, PRODUCT_TONE, TONES } from "./ui";

type PricingCopy = Dictionary["pricing"];

function planCopy(product: ProductKey, plan: Plan, t: PricingCopy) {
  if (product === "revenuepro") {
    const p = t.plans.revenuepro;
    const meta = p[plan.id as "monthly" | "sixMonths" | "yearly"];
    return { ...meta, features: p.features };
  }
  if (product === "codepay") {
    const p = t.plans.codepay;
    const id = plan.id as "monthly" | "sixMonths" | "lifetime";
    const features = { monthly: p.featuresMonthly, sixMonths: p.featuresSixMonths, lifetime: p.featuresLifetime }[id];
    return { ...p[id], features };
  }
  const p = t.plans.expense;
  const id = plan.id as "local" | "cloud" | "bundle";
  const features = { local: p.featuresLocal, cloud: p.featuresCloud, bundle: p.featuresBundle }[id];
  return { ...p[id], features };
}

export function PlanCard({
  product,
  plan,
  t,
  locale,
  isLoggedIn,
}: {
  product: ProductKey;
  plan: Plan;
  t: PricingCopy;
  locale: Locale;
  isLoggedIn: boolean;
}) {
  const copy = planCopy(product, plan, t);
  const tone = PRODUCT_TONE[product];
  const price = formatPrice(plan.bdt, locale);
  const dark = !!plan.highlight;

  const btnClass = `${dark ? BTN.accent : BTN.primary} w-full`;

  let cta: React.ReactNode;
  if (plan.href) {
    cta = <Link href={plan.href} className={btnClass}>{t.plans.expense.bundleCta}</Link>;
  } else if (isLoggedIn) {
    cta = <Link href="/dashboard" className={btnClass}>{t.goToDashboard}</Link>;
  } else {
    cta = <LeadCTAButton serviceType={plan.leadService} className={btnClass}>{t.subscribe}</LeadCTAButton>;
  }

  return (
    <div
      className={`cb-reveal relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
        dark
          ? "cb-gradient-border bg-slate-950 text-white shadow-[0_30px_80px_-30px_rgb(15_23_42/0.6)] md:-translate-y-4"
          : CARD
      }`}
    >
      {dark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
      )}

      <div className="relative flex items-center justify-between gap-3">
        <h3 className={`text-lg font-semibold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>{copy.name}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            dark ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30" : `${TONES[tone].soft} ${TONES[tone].text} ring-1 ${TONES[tone].softRing}`
          }`}
        >
          {dark ? t.popular : copy.badge}
        </span>
      </div>
      <p className={`relative mt-2 text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{copy.desc}</p>

      <div className="relative mt-6 flex items-baseline gap-1.5">
        <span className={`text-5xl font-semibold tracking-[-0.04em] ${dark ? "text-white" : "text-slate-950"}`}>{price ?? t.free}</span>
        <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{t.periods[plan.period]}</span>
      </div>

      <div className="relative mt-7">{cta}</div>

      <div className={`relative my-7 h-px ${dark ? "bg-white/10" : "bg-slate-100"}`} />
      <CheckList items={copy.features} tone={tone} dark={dark} className="relative" />
    </div>
  );
}

export function PlanGrid({
  product,
  t,
  locale,
  isLoggedIn,
}: {
  product: ProductKey;
  t: PricingCopy;
  locale: Locale;
  isLoggedIn: boolean;
}) {
  return (
    <div className="mx-auto grid max-w-5xl items-start gap-6 md:grid-cols-3">
      {PRODUCT_PLANS[product].map((plan) => (
        <PlanCard key={plan.id} product={product} plan={plan} t={t} locale={locale} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}

export function UsdNote({ t, locale }: { t: PricingCopy; locale: Locale }) {
  if (locale !== "en") return null;
  return <p className="mt-10 text-center text-xs text-slate-400">{t.usdNote}</p>;
}
