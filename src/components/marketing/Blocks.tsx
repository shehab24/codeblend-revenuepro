import { ChatBubbleLeftRightIcon, EnvelopeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { LeadCTAButton } from "@/components/LeadPopup";
import { prisma } from "@/lib/prisma";
import { localizeDigits, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { BTN, Container, Eyebrow, SectionHeading } from "./ui";
import { WHATSAPP_URL } from "./icons";

// Larger page sections shared by several marketing pages.

export async function LogoCloud({ label }: { label: string }) {
  const customers = await prisma.showcaseCustomer.findMany({ orderBy: { order: "asc" } });
  if (customers.length === 0) return null;

  // Repeat so the track is always wider than the screen, then duplicate for a seamless loop.
  const base = Array.from({ length: Math.max(1, Math.ceil(8 / customers.length)) }).flatMap(() => customers);
  const track = [...base, ...base];

  return (
    <div className="border-y border-slate-200/70 bg-slate-50/60 py-10">
      <p className="mb-7 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="cb-fade-x overflow-hidden">
        <ul className="animate-marquee gap-4 pr-4" style={{ animationDuration: `${track.length * 3}s` }}>
          {track.map((c, i) => {
            const hidden = i >= base.length;
            // Every logo sits in an identical tile with its name, so inconsistent
            // source images (faint, white or text-only) still look deliberate.
            const tile = (
              <span className="group flex h-24 w-44 flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition hover:ring-slate-300 hover:shadow-md">
                <span className="flex h-9 w-full items-center justify-center">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit logos of unknown size
                    <img
                      src={c.logoUrl}
                      alt={hidden ? "" : c.name}
                      className="max-h-9 max-w-[120px] object-contain opacity-80 brightness-[0.55] contrast-125 grayscale transition group-hover:opacity-100 group-hover:brightness-100 group-hover:contrast-100 group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium text-slate-500 group-hover:text-slate-900">{c.name}</span>
              </span>
            );
            return (
              <li key={`${c.id}-${i}`} className="shrink-0" aria-hidden={hidden || undefined}>
                {c.websiteUrl ? (
                  <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" title={c.name} tabIndex={hidden ? -1 : undefined}>
                    {tile}
                  </a>
                ) : (
                  tile
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function ProcessSteps({
  eyebrow,
  title,
  highlight,
  steps,
  locale,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  steps: { title: string; desc: string }[];
  locale: Locale;
}) {
  return (
    <Container>
      <SectionHeading eyebrow={eyebrow} title={title} highlight={highlight} />
      <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
        <span className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent md:block" />
        {steps.map((step, i) => (
          <li key={step.title} className="cb-reveal relative">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 ring-1 ring-slate-200 shadow-sm">
              {localizeDigits(i + 1, locale)}
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
          </li>
        ))}
      </ol>
    </Container>
  );
}

export function Faq({
  title,
  items,
  aside,
  locale,
}: {
  title: string;
  items: { q: string; a: string }[];
  aside: Dictionary["common"]["faqAside"];
  locale: Locale;
}) {
  return (
    <Container className="grid gap-12 lg:grid-cols-[1fr_1.55fr] lg:gap-16">
      <div className="cb-reveal lg:sticky lg:top-28 lg:self-start">
        <Eyebrow>{aside.eyebrow}</Eyebrow>
        <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-slate-950 text-balance sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-600">{aside.subtitle}</p>

        <div className="relative mt-8 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-emerald-300" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </span>
              <div>
                <p className="font-semibold">{aside.title}</p>
                <p className="text-xs text-slate-400">{aside.reply}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{aside.desc}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${BTN.accent} !px-4 !py-2.5`}>
                {aside.whatsapp}
              </a>
              <a href="mailto:info@codeblend.co" className={`${BTN.ghostDark} !px-4 !py-2.5`}>
                <EnvelopeIcon className="h-4 w-4" /> {aside.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="cb-reveal space-y-3">
        {items.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-2xl bg-white ring-1 ring-slate-200/80 transition-shadow open:shadow-[0_12px_32px_-16px_rgb(15_23_42/0.2)] open:ring-slate-300"
          >
            <summary className="flex cursor-pointer list-none items-center gap-5 px-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="font-mono text-xs text-slate-400 group-open:text-emerald-600">{localizeDigits(String(i + 1).padStart(2, "0"), locale)}</span>
              <span className="flex-1 text-base font-medium text-slate-900">{item.q}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 transition group-open:rotate-45 group-open:bg-slate-950 group-open:text-white group-open:ring-slate-950">
                <PlusIcon className="h-4 w-4" />
              </span>
            </summary>
            <p className="-mt-1 pb-6 pl-[3.6rem] pr-16 text-sm leading-relaxed text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}

export function CtaBand({
  title,
  subtitle,
  primary,
  secondary,
  leadService = "Get Started",
}: {
  title: string;
  subtitle: string;
  primary: string;
  secondary: string;
  leadService?: string;
}) {
  return (
    <Container>
      <div className="cb-reveal relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 text-center sm:px-12 md:py-24">
        <div className="cb-grid-dark pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white text-balance sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">{subtitle}</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <LeadCTAButton serviceType={leadService} className={BTN.accent}>
              {primary} →
            </LeadCTAButton>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={BTN.ghostDark}>
              {secondary}
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}
