import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

// Dashboard design kit. Mirrors the marketing site's language (ink + emerald,
// hairline rings, semibold type) in a denser, app-like scale. No hooks, so it
// works in server and client components.

export type DashTone = "emerald" | "sky" | "violet" | "amber" | "rose" | "indigo" | "teal" | "slate";

const TONE: Record<DashTone, { icon: string; soft: string; text: string; bar: string }> = {
  emerald: { icon: "bg-emerald-50 text-emerald-600 ring-emerald-100", soft: "bg-emerald-50", text: "text-emerald-700", bar: "from-emerald-400 to-teal-500" },
  sky: { icon: "bg-sky-50 text-sky-600 ring-sky-100", soft: "bg-sky-50", text: "text-sky-700", bar: "from-sky-400 to-blue-500" },
  violet: { icon: "bg-violet-50 text-violet-600 ring-violet-100", soft: "bg-violet-50", text: "text-violet-700", bar: "from-violet-400 to-fuchsia-500" },
  amber: { icon: "bg-amber-50 text-amber-600 ring-amber-100", soft: "bg-amber-50", text: "text-amber-700", bar: "from-amber-400 to-orange-500" },
  rose: { icon: "bg-rose-50 text-rose-600 ring-rose-100", soft: "bg-rose-50", text: "text-rose-700", bar: "from-rose-400 to-pink-500" },
  indigo: { icon: "bg-indigo-50 text-indigo-600 ring-indigo-100", soft: "bg-indigo-50", text: "text-indigo-700", bar: "from-indigo-400 to-violet-500" },
  teal: { icon: "bg-teal-50 text-teal-600 ring-teal-100", soft: "bg-teal-50", text: "text-teal-700", bar: "from-teal-400 to-cyan-500" },
  slate: { icon: "bg-slate-100 text-slate-600 ring-slate-200", soft: "bg-slate-100", text: "text-slate-700", bar: "from-slate-400 to-slate-600" },
};

export const DASH_CARD =
  "rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_6px_20px_-12px_rgb(15_23_42/0.08)]";

export const DASH_BTN = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] transition hover:bg-slate-800 cursor-pointer",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300 cursor-pointer",
  accent:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgb(16_185_129/0.6)] transition hover:bg-emerald-600 cursor-pointer",
};

export const TABLE = {
  wrap: "overflow-x-auto",
  table: "w-full text-left text-sm",
  th: "whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400",
  tr: "border-t border-slate-100 transition-colors hover:bg-slate-50/70",
  td: "px-5 py-3.5 text-slate-600",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && (
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] sm:flex">
            {icon}
          </span>
        )}
        <div>
          {eyebrow && <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-600">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.75rem]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "emerald",
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: React.ReactNode;
  tone?: DashTone;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${TONE[tone].icon}`}>{icon}</span>
        {href && (
          <ArrowUpRightIcon className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
        )}
      </div>
      <p className="mt-5 text-[13px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.7rem]">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      <span className={`absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-gradient-to-r opacity-0 transition group-hover:opacity-100 ${TONE[tone].bar}`} />
    </>
  );
  const cls = `group relative block overflow-hidden p-5 transition ${DASH_CARD} ${href ? "hover:-translate-y-0.5 hover:shadow-lg" : ""}`;
  return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`${DASH_CARD} overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-slate-950">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-950">
      {children}
      <ArrowUpRightIcon className="h-3.5 w-3.5" />
    </Link>
  );
}

const STATUS: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  used: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  in_progress: "bg-sky-50 text-sky-700 ring-sky-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  unpaid: "bg-amber-50 text-amber-700 ring-amber-200",
  unused: "bg-slate-100 text-slate-600 ring-slate-200",
  suspended: "bg-orange-50 text-orange-700 ring-orange-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  revoked: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  expired: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const key = status.toLowerCase();
  const cls = STATUS[key] ?? "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? key.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function QuickAction({
  href,
  icon,
  title,
  description,
  tone = "emerald",
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  tone?: DashTone;
  external?: boolean;
}) {
  const cls = "group flex items-center gap-3.5 rounded-xl p-3 transition hover:bg-slate-50";
  const body = (
    <>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${TONE[tone].icon}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        {description && <span className="block truncate text-xs text-slate-500">{description}</span>}
      </span>
      <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-700" />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
  ) : (
    <Link href={href} className={cls}>{body}</Link>
  );
}

export function toneClasses(tone: DashTone) {
  return TONE[tone];
}

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
