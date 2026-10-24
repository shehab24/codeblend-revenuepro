import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CodeBracketIcon, PresentationChartLineIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { LeadCTAButton } from "@/components/LeadPopup";
import { CtaBand, Faq, ProcessSteps } from "@/components/marketing/Blocks";
import { ServiceVisual } from "@/components/marketing/visuals";
import { BTN, CARD, CheckList, Container, IconBadge, Section, SectionHeading, PILLAR_TONE } from "@/components/marketing/ui";
import { PILLAR_HREF, PILLAR_ICONS, PILLAR_KEYS } from "@/components/marketing/icons";
import { getI18n } from "@/lib/i18n/server";

const EXTRA_ICONS = [CodeBracketIcon, PresentationChartLineIcon, WrenchScrewdriverIcon];

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.services.meta.title, description: t.services.meta.description };
}

export default async function ServicesPage() {
  const { locale, t } = await getI18n();
  const s = t.services;
  const labels = t.serviceDetail.labels;

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden pb-16 pt-20 md:pt-28">
        <div className="cb-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
        <Container className="relative">
          <SectionHeading as="h1" eyebrow={s.hero.eyebrow} title={s.hero.title} highlight={s.hero.highlight} subtitle={s.hero.subtitle} />
          <div className="flex flex-wrap justify-center gap-3">
            {PILLAR_KEYS.map((key) => {
              const Icon = PILLAR_ICONS[key];
              return (
                <Link
                  key={key}
                  href={PILLAR_HREF[key]}
                  className="inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm transition hover:ring-slate-300"
                >
                  <IconBadge tone={PILLAR_TONE[key]} size="sm"><Icon className="h-4 w-4" /></IconBadge>
                  {s.pillars[key].tag}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <Section muted className="!py-20">
        <Container className="space-y-6">
          {PILLAR_KEYS.map((key, i) => {
            const p = s.pillars[key];
            const Icon = PILLAR_ICONS[key];
            return (
              <article key={key} className={`cb-reveal grid items-center gap-10 overflow-hidden p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 ${CARD}`}>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <IconBadge tone={PILLAR_TONE[key]} size="lg"><Icon className="h-6 w-6" /></IconBadge>
                  <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{p.tag}</h2>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">{p.desc}</p>
                  <CheckList items={p.items.slice(0, 4).map((it) => it.title)} tone={PILLAR_TONE[key]} className="mt-6" />
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={PILLAR_HREF[key]} className={BTN.primary}>
                      {labels.viewService} <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <LeadCTAButton serviceType={p.lead} className={BTN.secondary}>
                      {t.common.cta.getQuote}
                    </LeadCTAButton>
                  </div>
                </div>
                <div className={`relative ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-slate-100 to-white" />
                  <div className="relative">
                    <ServiceVisual pillar={key} t={t.serviceDetail} />
                  </div>
                </div>
              </article>
            );
          })}
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow={s.extras.eyebrow} title={s.extras.title} tone="slate" />
          <div className="grid gap-5 md:grid-cols-3">
            {s.extras.items.map((item, i) => {
              const Icon = EXTRA_ICONS[i];
              return (
                <div key={item.title} className={`cb-reveal flex flex-col p-7 ${CARD}`}>
                  <IconBadge tone="slate"><Icon className="h-5 w-5" /></IconBadge>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  <LeadCTAButton serviceType={item.lead} className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-950 hover:text-emerald-700 cursor-pointer">
                    {t.common.cta.getQuote} <ArrowRightIcon className="h-4 w-4" />
                  </LeadCTAButton>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section muted>
        <ProcessSteps eyebrow={t.home.process.eyebrow} title={t.home.process.title} highlight={t.home.process.highlight} steps={t.home.process.steps} locale={locale} />
      </Section>

      <Section>
        <Faq title={s.faq.title} items={s.faq.items} aside={t.common.faqAside} locale={locale} />
      </Section>

      <section className="pb-24 md:pb-32">
        <CtaBand
          title={labels.ctaTitle}
          subtitle={labels.ctaSubtitle}
          primary={t.common.cta.bookCall}
          secondary={t.home.finalCta.secondary}
          leadService="Free Consultation"
        />
      </section>

    </div>
  );
}
