import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { CtaBand } from "@/components/marketing/Blocks";
import { BTN, Container, IconBadge, SectionHeading, PRODUCT_TONE, TONES } from "@/components/marketing/ui";
import { PRODUCT_HREF, PRODUCT_ICONS, PRODUCT_KEYS } from "@/components/marketing/icons";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.features.meta.title, description: t.features.meta.description };
}

export default async function FeaturesPage() {
  const { t } = await getI18n();
  const f = t.features;

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden pb-12 pt-20 md:pt-28">
        <div className="cb-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <Container className="relative">
          <SectionHeading as="h1" eyebrow={f.hero.eyebrow} title={f.hero.title} highlight={f.hero.highlight} subtitle={f.hero.subtitle} tone="indigo" />
        </Container>
      </section>

      <div className="space-y-24 pb-24 md:space-y-32 md:pb-32">
        {PRODUCT_KEYS.map((key) => {
          const s = f.sections[key];
          const tone = PRODUCT_TONE[key];
          const Icon = PRODUCT_ICONS[key];
          return (
            <Container key={key}>
              <section className="cb-reveal">
                <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div className="flex items-start gap-5">
                    <IconBadge tone={tone} size="lg" solid><Icon className="h-6 w-6" /></IconBadge>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{s.tag}</span>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{s.title}</h2>
                      <p className="mt-2 max-w-xl text-base text-slate-600">{s.desc}</p>
                    </div>
                  </div>
                  <Link href={PRODUCT_HREF[key]} className={`${BTN.secondary} self-start md:self-end`}>
                    {f.explore} {t.common.productMenu[key].title}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-px overflow-hidden rounded-3xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                  {s.items.map((item) => (
                    <div key={item.title} className="bg-white p-7 transition hover:bg-slate-50/70">
                      <span className={`block h-1 w-8 rounded-full bg-gradient-to-r ${TONES[tone].gradient}`} />
                      <h3 className="mt-5 text-base font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Container>
          );
        })}
      </div>

      <section className="pb-24 md:pb-32">
        <CtaBand
          title={f.cta.title}
          subtitle={f.cta.subtitle}
          primary={t.common.cta.startProject}
          secondary={t.home.finalCta.secondary}
          leadService="Features Page CTA"
        />
      </section>
    </div>
  );
}
