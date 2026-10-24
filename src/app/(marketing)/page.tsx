import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CubeIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LifebuoyIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { LeadCTAButton } from "@/components/LeadPopup";
import { PricingSectionWithTabs } from "@/components/PricingSectionWithTabs";
import { CtaBand, Faq, LogoCloud, ProcessSteps } from "@/components/marketing/Blocks";
import { AIVisual, ShopifyVisual, WordPressVisual } from "@/components/marketing/visuals";
import { BTN, CARD, CARD_DARK, Container, Eyebrow, IconBadge, Section, SectionHeading, PILLAR_TONE, PRODUCT_TONE } from "@/components/marketing/ui";
import { PILLAR_HREF, PILLAR_ICONS, PRODUCT_HREF, PRODUCT_ICONS, PRODUCT_KEYS } from "@/components/marketing/icons";
import { getI18n } from "@/lib/i18n/server";
import { localizeDigits } from "@/lib/i18n/config";

const FLOW_ICONS = [ShoppingCartIcon, ShieldCheckIcon, TruckIcon, ChatBubbleLeftRightIcon];
const WHY_ICONS = [CubeIcon, GlobeAltIcon, BoltIcon, LifebuoyIcon];
const CONSULT_ICONS = [PhoneIcon, DocumentTextIcon, ClipboardDocumentCheckIcon];
const PRODUCT_SHOTS = {
  revenuepro: { src: "/feature-fraud.png", width: 865, height: 539 },
  codepay: { src: "/codepay-options.png", width: 453, height: 459 },
  expense: { src: "/expense-dashboard-usd-v3.png", width: 865, height: 481 },
};

// Tinted backdrop the UI preview sits on inside each service card.
const STAGE = {
  wordpress: "bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100/70",
  ai: "bg-gradient-to-br from-violet-100/80 via-slate-50 to-fuchsia-50",
  shopify: "bg-gradient-to-br from-lime-50 via-slate-50 to-emerald-100/70",
};

function PillarCard({
  pillar,
  title,
  desc,
  explore,
  className,
  children,
}: {
  pillar: "wordpress" | "ai" | "shopify";
  title: string;
  desc: string;
  explore: string;
  className: string;
  children: React.ReactNode;
}) {
  const Icon = PILLAR_ICONS[pillar];
  return (
    <Link
      href={PILLAR_HREF[pillar]}
      className={`cb-reveal group relative flex flex-col overflow-hidden ${CARD} transition duration-300 hover:shadow-xl ${className}`}
    >
      <div className="flex items-start gap-4 p-7 sm:p-8">
        <IconBadge tone={PILLAR_TONE[pillar]}><Icon className="h-5 w-5" /></IconBadge>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">{desc}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-slate-200 transition group-hover:bg-slate-950 group-hover:text-white group-hover:ring-slate-950">
          <ArrowUpRightIcon className="h-4 w-4" />
          <span className="sr-only">{explore}</span>
        </span>
      </div>
      {/* UI preview on a tinted stage, cropped cleanly by the stage edge */}
      <div className={`relative mx-3 mb-3 mt-auto h-64 overflow-hidden rounded-[1.25rem] ring-1 ring-slate-900/5 ${STAGE[pillar]}`}>
        <div className="cb-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:none]" />
        <div className="absolute inset-x-5 top-6 transition duration-500 group-hover:-translate-y-2 sm:inset-x-8">{children}</div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const { userId } = await auth();
  const { locale, t } = await getI18n();
  const h = t.home;
  const c = t.common;
  const sd = t.serviceDetail;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="cb-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

        <Container className="relative grid items-center gap-16 pb-12 pt-16 md:pt-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="text-center lg:text-left">
            <Eyebrow>{h.hero.badge}</Eyebrow>
            <h1 className="mt-7 text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 text-balance sm:text-5xl md:text-[4.25rem]">
              {h.hero.titleA}{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {h.hero.titleB}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 text-pretty sm:text-lg lg:mx-0">{h.hero.subtitle}</p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              {userId ? (
                <Link href="/dashboard" className={BTN.primary}>
                  {c.cta.openDashboard} <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <LeadCTAButton serviceType="Get Started" className={BTN.primary}>
                  {h.hero.primary} <ArrowRightIcon className="h-4 w-4" />
                </LeadCTAButton>
              )}
              <Link href="/services" className={BTN.secondary}>{h.hero.secondary}</Link>
            </div>

            <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 lg:justify-start">
              {h.hero.trust.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Automation flow mock */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-200/60 via-white to-violet-200/60 blur-2xl" />
            <div className="relative rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200 shadow-[0_30px_80px_-30px_rgb(15_23_42/0.35)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-950">{h.flow.title}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {h.flow.status}
                </span>
              </div>
              <ol className="relative space-y-2.5">
                <span className="absolute bottom-6 left-[21px] top-6 w-px bg-gradient-to-b from-emerald-300 via-violet-300 to-sky-300" />
                {h.flow.steps.map((step, i) => {
                  const Icon = FLOW_ICONS[i];
                  const tone = (["emerald", "violet", "blue", "lime"] as const)[i];
                  return (
                    <li key={step.label} className="relative flex items-center gap-4 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                      <IconBadge tone={tone} solid><Icon className="h-5 w-5" /></IconBadge>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900">{step.label}</span>
                        <span className="block truncate text-xs text-slate-500">{step.detail}</span>
                      </div>
                      <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                    </li>
                  );
                })}
              </ol>
              <p className="mt-5 rounded-xl bg-slate-950 px-4 py-3 text-center text-xs font-medium text-slate-200">⚡ {h.flow.footer}</p>
            </div>
          </div>
        </Container>

        {/* Stats */}
        <Container className="relative">
          <dl className="grid grid-cols-2 divide-slate-200 border-y border-slate-200 sm:grid-cols-4 sm:divide-x">
            {h.stats.map((stat) => (
              <div key={stat.label} className="px-4 py-8 text-center">
                <dt className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{stat.value}</dt>
                <dd className="mt-1.5 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </Container>

        <div className="mt-14">
          <LogoCloud label={h.logos} />
        </div>
      </section>

      {/* ═══════════ SERVICES BENTO ═══════════ */}
      <Section muted>
        <Container>
          <SectionHeading eyebrow={h.pillars.eyebrow} title={h.pillars.title} highlight={h.pillars.highlight} subtitle={h.pillars.subtitle} />
          <div className="grid gap-5 lg:grid-cols-12">
            <PillarCard pillar="wordpress" {...h.pillars.items.wordpress} explore={h.pillars.explore} className="lg:col-span-7">
              <WordPressVisual v={sd.wordpress.visual} compact />
            </PillarCard>
            <PillarCard pillar="ai" {...h.pillars.items.ai} explore={h.pillars.explore} className="lg:col-span-5">
              <AIVisual v={sd.ai.visual} />
            </PillarCard>
            <PillarCard pillar="shopify" {...h.pillars.items.shopify} explore={h.pillars.explore} className="lg:col-span-5">
              <ShopifyVisual v={sd.shopify.visual} />
            </PillarCard>

            <div className="cb-reveal relative flex flex-col overflow-hidden rounded-3xl bg-slate-950 p-8 text-white lg:col-span-7 sm:p-10">
              <div className="cb-grid-dark pointer-events-none absolute inset-0" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
              <div className="relative">
                <h3 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">{h.bento.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">{h.bento.desc}</p>
              </div>

              <ol className="relative mt-8 grid gap-3 sm:grid-cols-3">
                {h.bento.steps.map((step, i) => {
                  const StepIcon = CONSULT_ICONS[i];
                  return (
                    <li key={step.title} className="relative flex items-center gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:block">
                      <div className="flex shrink-0 items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/25">
                          <StepIcon className="h-4 w-4 text-emerald-300" />
                        </span>
                        <span className="hidden font-mono text-[11px] text-slate-500 sm:inline">{localizeDigits(`0${i + 1}`, locale)}</span>
                      </div>
                      <div className="sm:mt-4">
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{step.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="relative mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                  {h.bento.note}
                </p>
                <LeadCTAButton serviceType="Free Consultation" className={`${BTN.accent} shrink-0`}>
                  {h.bento.button} →
                </LeadCTAButton>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ═══════════ PROCESS ═══════════ */}
      <Section>
        <ProcessSteps eyebrow={h.process.eyebrow} title={h.process.title} highlight={h.process.highlight} steps={h.process.steps} locale={locale} />
      </Section>

      {/* ═══════════ PRODUCTS ═══════════ */}
      <Section dark id="products">
        <Container>
          <SectionHeading dark eyebrow={h.products.eyebrow} title={h.products.title} highlight={h.products.highlight} subtitle={h.products.subtitle} />
          <div className="grid gap-5 md:grid-cols-3">
            {PRODUCT_KEYS.map((key) => {
              const p = h.products.items[key];
              const Icon = PRODUCT_ICONS[key];
              const shot = PRODUCT_SHOTS[key];
              return (
                <Link
                  key={key}
                  href={PRODUCT_HREF[key]}
                  className={`cb-reveal group flex flex-col overflow-hidden ${CARD_DARK} transition hover:bg-white/[0.06] hover:ring-white/20`}
                >
                  <div className="p-7">
                    <div className="flex items-center justify-between">
                      <IconBadge tone={PRODUCT_TONE[key]} dark><Icon className="h-5 w-5" /></IconBadge>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{p.tag}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                      {h.products.explore}
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="relative mt-auto h-44 overflow-hidden px-7">
                    <Image
                      src={shot.src}
                      alt={p.title}
                      width={shot.width}
                      height={shot.height}
                      className="w-full rounded-t-xl object-cover object-top opacity-80 ring-1 ring-white/10 transition duration-500 group-hover:-translate-y-2 group-hover:opacity-100"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ═══════════ WHY US ═══════════ */}
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading align="left" eyebrow={h.why.eyebrow} title={h.why.title} highlight={h.why.highlight} className="mb-8" />
            <Link href="/services" className={BTN.secondary}>
              {h.hero.secondary} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-2">
            {h.why.items.map((item, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <div key={item.title} className="cb-reveal bg-white p-7">
                  <Icon className="h-6 w-6 text-emerald-600" />
                  <h3 className="mt-5 text-base font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ═══════════ PRICING ═══════════ */}
      <PricingSectionWithTabs t={t.pricing} locale={locale} isLoggedIn={!!userId} />

      {/* ═══════════ FAQ ═══════════ */}
      <Section>
        <Faq title={h.faqTitle} items={t.services.faq.items} aside={c.faqAside} locale={locale} />
      </Section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="pb-24 md:pb-32" id="contact">
        <CtaBand title={h.finalCta.title} subtitle={h.finalCta.subtitle} primary={h.finalCta.primary} secondary={h.finalCta.secondary} leadService="Free Trial" />
      </section>
    </div>
  );
}
