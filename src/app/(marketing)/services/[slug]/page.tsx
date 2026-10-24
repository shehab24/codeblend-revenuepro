import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  ArrowUpRightIcon,
  BoltIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CpuChipIcon,
  CreditCardIcon,
  DocumentTextIcon,
  InboxStackIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  ShoppingCartIcon,
  SwatchIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { LeadCTAButton } from "@/components/LeadPopup";
import { CtaBand, Faq, ProcessSteps } from "@/components/marketing/Blocks";
import { ServiceVisual } from "@/components/marketing/visuals";
import { BTN, CARD, CARD_DARK, CheckList, Container, Eyebrow, IconBadge, Section, SectionHeading, PILLAR_TONE, TONES } from "@/components/marketing/ui";
import { PILLAR_HREF, PILLAR_ICONS, PILLAR_KEYS, pillarFromSlug, type PillarKey } from "@/components/marketing/icons";
import { getI18n } from "@/lib/i18n/server";
import { localizeDigits } from "@/lib/i18n/config";

// One icon per offering, in the same order as t.services.pillars[key].items.
const OFFERING_ICONS: Record<PillarKey, React.ComponentType<{ className?: string }>[]> = {
  wordpress: [PuzzlePieceIcon, ShoppingCartIcon, CreditCardIcon, BoltIcon, PaintBrushIcon, WrenchScrewdriverIcon],
  ai: [ChatBubbleLeftRightIcon, ArrowPathIcon, DocumentTextIcon, InboxStackIcon, CpuChipIcon, ChartBarIcon],
  shopify: [BuildingStorefrontIcon, SwatchIcon, PuzzlePieceIcon, ArrowsRightLeftIcon, TruckIcon, ArrowTrendingUpIcon],
};

async function resolve(params: Promise<{ slug: string }>) {
  const pillar = pillarFromSlug((await params).slug);
  if (!pillar) notFound();
  return pillar;
}

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const pillar = pillarFromSlug((await props.params).slug);
  if (!pillar) return {};
  const { t } = await getI18n();
  return { title: t.serviceDetail[pillar].meta.title, description: t.serviceDetail[pillar].meta.description };
}

export default async function ServiceDetailPage(props: PageProps<"/services/[slug]">) {
  const pillar = await resolve(props.params);
  const { locale, t } = await getI18n();
  const p = t.services.pillars[pillar];
  const d = t.serviceDetail[pillar];
  const labels = t.serviceDetail.labels;
  const tone = PILLAR_TONE[pillar];
  const Icon = PILLAR_ICONS[pillar];
  const others = PILLAR_KEYS.filter((k) => k !== pillar);

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden pb-20 pt-12 md:pb-28 md:pt-16">
        <div className="cb-grid pointer-events-none absolute inset-0" />
        <div className={`pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full blur-3xl ${TONES[tone].glow}`} />
        <Container className="relative">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/services" className="hover:text-slate-900">{labels.breadcrumb}</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-900">{p.tag}</span>
          </nav>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <IconBadge tone={tone} solid><Icon className="h-5 w-5" /></IconBadge>
                <Eyebrow tone={tone}>{p.tag}</Eyebrow>
              </div>
              <h1 className="mt-7 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 text-balance sm:text-5xl md:text-6xl">
                {d.heroTitle} <span className="text-slate-400">{d.heroHighlight}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 text-pretty sm:text-lg">{p.desc}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <LeadCTAButton serviceType={p.lead} className={BTN.primary}>
                  {p.cta} <ArrowRightIcon className="h-4 w-4" />
                </LeadCTAButton>
                <a href="#offerings" className={BTN.secondary}>{labels.offeringsEyebrow}</a>
              </div>
              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {d.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-1.5">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-white via-slate-100 to-white blur-xl" />
              <div className="relative">
                <ServiceVisual pillar={pillar} t={t.serviceDetail} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════ OFFERINGS ═══════════ */}
      <Section muted id="offerings">
        <Container>
          <SectionHeading eyebrow={labels.offeringsEyebrow} title={labels.offeringsTitle} highlight={labels.offeringsHighlight} tone={tone} />
          <div className="grid gap-px overflow-hidden rounded-3xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {p.items.map((item, i) => {
              const ItemIcon = OFFERING_ICONS[pillar][i];
              return (
                <div key={item.title} className="cb-reveal group bg-white p-8 transition hover:bg-slate-50/60">
                  <IconBadge tone={tone}><ItemIcon className="h-5 w-5" /></IconBadge>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ═══════════ USE CASES ═══════════ */}
      <Section dark>
        <Container>
          <SectionHeading dark eyebrow={labels.useCasesEyebrow} title={labels.useCasesTitle} tone={tone} />
          <div className="grid gap-5 md:grid-cols-3">
            {d.useCases.map((u, i) => (
              <div key={u.title} className={`cb-reveal p-8 ${CARD_DARK}`}>
                <span className="font-mono text-sm text-slate-500">{localizeDigits(`0${i + 1}`, locale)}</span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{u.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{u.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══════════ PROCESS ═══════════ */}
      <Section>
        <ProcessSteps eyebrow={labels.processEyebrow} title={labels.processTitle} steps={t.home.process.steps} locale={locale} />
      </Section>

      {/* ═══════════ INCLUDED + ENGAGEMENT ═══════════ */}
      <Section muted>
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="cb-reveal relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="relative">
              <Eyebrow dark>{labels.includedEyebrow}</Eyebrow>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{labels.includedTitle}</h2>
              <CheckList items={labels.included} dark className="mt-8" />
            </div>
          </div>
          <div className={`cb-reveal p-8 sm:p-10 ${CARD}`}>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{labels.engagementTitle}</h2>
            <ul className="mt-8 divide-y divide-slate-100">
              {labels.engagements.map((e, i) => (
                <li key={e.title} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {localizeDigits(i + 1, locale)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-950">{e.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{e.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <LeadCTAButton serviceType={p.lead} className={`${BTN.primary} mt-8`}>
              {t.common.cta.getQuote} <ArrowRightIcon className="h-4 w-4" />
            </LeadCTAButton>
          </div>
        </Container>
      </Section>

      {/* ═══════════ STACK ═══════════ */}
      <Section className="!py-20">
        <Container>
          <SectionHeading eyebrow={labels.stackEyebrow} title={labels.stackTitle} tone={tone} className="!mb-10" />
          <ul className="cb-reveal mx-auto flex max-w-4xl flex-wrap justify-center gap-2.5">
            {d.stack.map((name) => (
              <li key={name} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
                {name}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ═══════════ FAQ ═══════════ */}
      <Section muted>
        <Faq title={labels.faqTitle} items={d.faq} aside={t.common.faqAside} locale={locale} />
      </Section>

      {/* ═══════════ RELATED ═══════════ */}
      <Section>
        <Container>
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-slate-950">{labels.relatedTitle}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {others.map((key) => {
              const OtherIcon = PILLAR_ICONS[key];
              return (
                <Link key={key} href={PILLAR_HREF[key]} className={`cb-reveal group flex items-center gap-5 p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${CARD}`}>
                  <IconBadge tone={PILLAR_TONE[key]} size="lg"><OtherIcon className="h-6 w-6" /></IconBadge>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-950">{t.services.pillars[key].tag}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{t.home.pillars.items[key].desc}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-slate-200 transition group-hover:bg-slate-950 group-hover:text-white group-hover:ring-slate-950">
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <section className="pb-24 md:pb-32">
        <CtaBand title={labels.ctaTitle} subtitle={labels.ctaSubtitle} primary={p.cta} secondary={t.home.finalCta.secondary} leadService={p.lead} />
      </section>
    </div>
  );
}
