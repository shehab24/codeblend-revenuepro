import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { LeadCTAButton } from "@/components/LeadPopup";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { ProductKey } from "@/lib/pricing";
import { PlanGrid, UsdNote } from "./PlanCard";
import { BTN, CheckList, Container, Eyebrow, IconBadge, SectionHeading, PRODUCT_TONE, TONES, type Tone } from "./ui";
import { PRODUCT_ICONS } from "./icons";

export function ProductHero({
  product,
  badge,
  title,
  highlight,
  subtitle,
  primary,
  dashboardLabel,
  secondary,
  isLoggedIn,
  leadService,
  visual,
}: {
  product: ProductKey;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  primary: string;
  dashboardLabel: string;
  secondary: string;
  isLoggedIn: boolean;
  leadService: string;
  visual: React.ReactNode;
}) {
  const tone = PRODUCT_TONE[product];
  const Icon = PRODUCT_ICONS[product];

  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="cb-grid pointer-events-none absolute inset-0" />
      <div className={`pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full blur-3xl ${TONES[tone].glow}`} />
      <Container className="relative grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <IconBadge tone={tone} solid><Icon className="h-5 w-5" /></IconBadge>
            <Eyebrow tone={tone}>{badge}</Eyebrow>
          </div>
          <h1 className="mt-7 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 text-balance sm:text-5xl md:text-[3.5rem]">
            {title} <span className="text-slate-400">{highlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 text-pretty sm:text-lg lg:mx-0">{subtitle}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            {isLoggedIn ? (
              <Link href="/dashboard" className={BTN.primary}>
                {dashboardLabel} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <LeadCTAButton serviceType={leadService} className={BTN.primary}>
                {primary} <ArrowRightIcon className="h-4 w-4" />
              </LeadCTAButton>
            )}
            <a href="#pricing" className={BTN.secondary}>{secondary}</a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-white via-slate-100 to-white blur-xl" />
          <div className="relative">{visual}</div>
        </div>
      </Container>
    </section>
  );
}

// Soft stage behind screenshots so they read as product shots, not loose images.
export function MediaStage({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200/80 sm:p-10">
      <div className={`pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-3xl ${TONES[tone].glow}`} />
      <div className="relative flex justify-center">{children}</div>
    </div>
  );
}

export function FeatureRow({
  tag,
  title,
  desc,
  points,
  tone,
  reverse = false,
  tagColor,
  children,
}: {
  tag: string;
  title: string;
  desc: string;
  points: string[];
  tone: Tone;
  reverse?: boolean;
  tagColor?: string; // optional brand colour (e.g. bKash pink) for the eyebrow dot
  children: React.ReactNode;
}) {
  return (
    <section className={`cb-reveal grid items-center gap-10 md:gap-16 lg:grid-cols-[1fr_1.15fr]`}>
      <div className={`space-y-5 ${reverse ? "lg:order-2" : ""}`}>
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          <span style={tagColor ? { backgroundColor: tagColor } : undefined} className={`h-1.5 w-1.5 rounded-full ${tagColor ? "" : TONES[tone].dot}`} />
          {tag}
        </span>
        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h2>
        <p className="text-base leading-relaxed text-slate-600">{desc}</p>
        <CheckList items={points} tone={tone} />
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <MediaStage tone={tone}>{children}</MediaStage>
      </div>
    </section>
  );
}

export function ProductPricingSection({
  product,
  title,
  subtitle,
  t,
  locale,
  isLoggedIn,
}: {
  product: ProductKey;
  title: string;
  subtitle: string;
  t: Dictionary["pricing"];
  locale: Locale;
  isLoggedIn: boolean;
}) {
  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden bg-slate-50/70 py-24 md:py-32">
      <div className="cb-grid pointer-events-none absolute inset-0 opacity-60" />
      <Container className="relative">
        <SectionHeading eyebrow={t.eyebrow} title={title} subtitle={subtitle} tone={PRODUCT_TONE[product]} />
        <PlanGrid product={product} t={t} locale={locale} isLoggedIn={isLoggedIn} />
        <UsdNote t={t} locale={locale} />
      </Container>
    </section>
  );
}
