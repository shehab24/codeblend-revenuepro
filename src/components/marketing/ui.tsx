import { CheckIcon } from "@heroicons/react/24/outline";

// Shared building blocks for the marketing pages. No hooks, so they work in
// both server and client components.
//
// Design language: ink (slate-950) + a single emerald accent, semibold display
// type with a muted second half, hairline rings instead of heavy borders, and
// dark "spotlight" sections for contrast.

export const BTN = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_8px_24px_-8px_rgb(15_23_42/0.5)] transition hover:bg-slate-800 cursor-pointer",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300 cursor-pointer",
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_-8px_rgb(16_185_129/0.7)] transition hover:bg-emerald-400 cursor-pointer",
  light:
    "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 cursor-pointer",
  ghostDark:
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10 cursor-pointer",
};

export const CARD =
  "rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.08)]";
export const CARD_DARK = "rounded-3xl bg-white/[0.03] ring-1 ring-white/10";

export function Container({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Section({
  id,
  dark = false,
  muted = false,
  className = "",
  children,
}: {
  id?: string;
  dark?: boolean;
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const bg = dark ? "bg-slate-950 text-white" : muted ? "bg-slate-50/70" : "bg-white";
  return (
    <section id={id} className={`relative scroll-mt-20 overflow-hidden py-24 md:py-32 ${bg} ${className}`}>
      {dark && (
        <>
          <div className="cb-grid-dark pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        </>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, dark = false, tone = "emerald" }: { children: React.ReactNode; dark?: boolean; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        dark ? "bg-white/5 text-slate-300 ring-1 ring-white/10" : "bg-white text-slate-600 ring-1 ring-slate-200 shadow-sm"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TONES[tone].dot}`} />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  tone = "emerald",
  align = "center",
  dark = false,
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  tone?: Tone;
  align?: "center" | "left";
  dark?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`cb-reveal ${centered ? "mx-auto text-center" : ""} mb-14 max-w-3xl ${className}`}>
      {eyebrow && (
        <div className="mb-5">
          <Eyebrow dark={dark} tone={tone}>{eyebrow}</Eyebrow>
        </div>
      )}
      <Tag
        className={`font-semibold tracking-[-0.03em] text-balance ${dark ? "text-white" : "text-slate-950"} ${
          Tag === "h1" ? "text-4xl leading-[1.05] sm:text-5xl md:text-6xl" : "text-3xl leading-[1.1] sm:text-4xl md:text-5xl"
        }`}
      >
        {title}
        {highlight && (
          <>
            {" "}
            <span className={dark ? "text-slate-500" : "text-slate-400"}>{highlight}</span>
          </>
        )}
      </Tag>
      {subtitle && (
        <p
          className={`mt-5 text-base leading-relaxed text-pretty sm:text-lg ${dark ? "text-slate-400" : "text-slate-600"} ${
            centered ? "mx-auto max-w-2xl" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function CheckList({
  items,
  tone = "emerald",
  className = "",
  dark = false,
}: {
  items: string[];
  tone?: Tone;
  className?: string;
  dark?: boolean;
}) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
          <span
            className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
              dark ? "bg-emerald-400/10 ring-1 ring-emerald-400/30" : `${TONES[tone].soft} ring-1 ${TONES[tone].softRing}`
            }`}
          >
            <CheckIcon className={`h-2.5 w-2.5 ${dark ? "text-emerald-300" : TONES[tone].text}`} strokeWidth={3.5} />
          </span>
          <span className="leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type Tone = "emerald" | "teal" | "indigo" | "blue" | "violet" | "lime" | "rose" | "slate";

// Full class strings so Tailwind can see them.
export const TONES: Record<
  Tone,
  { textDark: string; dot: string; gradient: string; soft: string; softRing: string; text: string; solid: string; ring: string; glow: string }
> = {
  emerald: {
    textDark: "text-emerald-300",
    dot: "bg-emerald-500",
    gradient: "from-emerald-400 to-teal-500",
    soft: "bg-emerald-50",
    softRing: "ring-emerald-200/70",
    text: "text-emerald-600",
    solid: "bg-emerald-600 hover:bg-emerald-700",
    ring: "hover:ring-emerald-300",
    glow: "bg-emerald-400/20",
  },
  teal: {
    textDark: "text-teal-300",
    dot: "bg-teal-500",
    gradient: "from-teal-400 to-cyan-500",
    soft: "bg-teal-50",
    softRing: "ring-teal-200/70",
    text: "text-teal-600",
    solid: "bg-teal-600 hover:bg-teal-700",
    ring: "hover:ring-teal-300",
    glow: "bg-teal-400/20",
  },
  indigo: {
    textDark: "text-indigo-300",
    dot: "bg-indigo-500",
    gradient: "from-indigo-500 to-violet-500",
    soft: "bg-indigo-50",
    softRing: "ring-indigo-200/70",
    text: "text-indigo-600",
    solid: "bg-indigo-600 hover:bg-indigo-700",
    ring: "hover:ring-indigo-300",
    glow: "bg-indigo-400/20",
  },
  blue: {
    textDark: "text-sky-300",
    dot: "bg-sky-500",
    gradient: "from-sky-400 to-blue-600",
    soft: "bg-sky-50",
    softRing: "ring-sky-200/70",
    text: "text-sky-600",
    solid: "bg-sky-600 hover:bg-sky-700",
    ring: "hover:ring-sky-300",
    glow: "bg-sky-400/20",
  },
  violet: {
    textDark: "text-violet-300",
    dot: "bg-violet-500",
    gradient: "from-violet-500 to-fuchsia-500",
    soft: "bg-violet-50",
    softRing: "ring-violet-200/70",
    text: "text-violet-600",
    solid: "bg-violet-600 hover:bg-violet-700",
    ring: "hover:ring-violet-300",
    glow: "bg-violet-400/20",
  },
  lime: {
    textDark: "text-lime-300",
    dot: "bg-lime-500",
    gradient: "from-lime-400 to-emerald-600",
    soft: "bg-lime-50",
    softRing: "ring-lime-200/70",
    text: "text-lime-700",
    solid: "bg-lime-600 hover:bg-lime-700",
    ring: "hover:ring-lime-300",
    glow: "bg-lime-400/20",
  },
  rose: {
    textDark: "text-rose-300",
    dot: "bg-rose-500",
    gradient: "from-rose-500 to-orange-500",
    soft: "bg-rose-50",
    softRing: "ring-rose-200/70",
    text: "text-rose-600",
    solid: "bg-rose-600 hover:bg-rose-700",
    ring: "hover:ring-rose-300",
    glow: "bg-rose-400/20",
  },
  slate: {
    textDark: "text-slate-300",
    dot: "bg-slate-400",
    gradient: "from-slate-600 to-slate-900",
    soft: "bg-slate-100",
    softRing: "ring-slate-200",
    text: "text-slate-700",
    solid: "bg-slate-900 hover:bg-slate-800",
    ring: "hover:ring-slate-300",
    glow: "bg-slate-400/20",
  },
};

// Pillar/product brand marks reused across nav, home and services.
export const PILLAR_TONE = { wordpress: "blue", ai: "violet", shopify: "lime" } as const;
export const PRODUCT_TONE = { revenuepro: "emerald", codepay: "teal", expense: "indigo" } as const;

// Icon tile: white with a hairline ring and a tinted icon (or a gradient fill with `solid`).
export function IconBadge({
  tone,
  children,
  size = "md",
  solid = false,
  dark = false,
}: {
  tone: Tone;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  solid?: boolean;
  dark?: boolean;
}) {
  const dims = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl";
  const look = solid
    ? `bg-gradient-to-br text-white shadow-sm ${TONES[tone].gradient}`
    : dark
      ? `bg-white/5 ring-1 ring-white/10 ${TONES[tone].textDark}`
      : `bg-white ring-1 ring-slate-200 shadow-sm ${TONES[tone].text}`;
  return <span className={`flex shrink-0 items-center justify-center ${dims} ${look}`}>{children}</span>;
}

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-xl bg-slate-950 text-lg font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
    >
      <span className="bg-gradient-to-br from-emerald-300 to-teal-400 bg-clip-text text-transparent">C</span>
    </span>
  );
}

// A browser-window frame for screenshots and UI mocks.
export function BrowserFrame({
  url,
  children,
  className = "",
  dark = false,
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl ${
        dark ? "bg-slate-900 ring-1 ring-white/10" : "bg-white ring-1 ring-slate-200"
      } shadow-[0_24px_60px_-20px_rgb(15_23_42/0.25)] ${className}`}
    >
      <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${dark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"}`}>
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </span>
        {url && (
          <span
            className={`mx-auto truncate rounded-md px-3 py-0.5 font-mono text-[10px] ${
              dark ? "bg-white/5 text-slate-400" : "bg-white text-slate-400 ring-1 ring-slate-200"
            }`}
          >
            {url}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
