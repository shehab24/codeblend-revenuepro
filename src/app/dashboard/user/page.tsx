import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  BanknotesIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CloudArrowDownIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  PlayCircleIcon,
  PlusIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { getLicenseFinancials } from "@/lib/licenseFinancials";
import {
  DASH_CARD,
  EmptyState,
  Panel,
  PanelLink,
  QuickAction,
  StatusBadge,
  formatBdt,
  timeAgo,
  toneClasses,
  type DashTone,
} from "@/components/dashboard/ui";

export default async function UserDashboard() {
  const { userId } = await auth();

  if (!userId) return null;

  const [clerkUser, dbUser, requests, licenses] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { revenueProAllowed: true, bkashTrackerAllowed: true, expenseTrackerAllowed: true },
    }),
    prisma.serviceRequest.findMany({
      where: { applicantId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, serviceType: true, status: true, totalAmount: true, paidAmount: true, createdAt: true },
    }),
    prisma.license.findMany({
      where: { userId },
      select: {
        id: true,
        tier: true,
        status: true,
        paymentStatus: true,
        expirationDate: true,
        transactions: { select: { licenseId: true, amount: true, status: true } },
      },
    }),
  ]);

  const customers = await prisma.showcaseCustomer.findMany({ orderBy: { order: "asc" } });

  const revenueProAllowed = dbUser?.revenueProAllowed ?? true;
  const bkashTrackerAllowed = dbUser?.bkashTrackerAllowed ?? false;
  const expenseTrackerAllowed = dbUser?.expenseTrackerAllowed ?? false;

  const activeRequests = requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const now = new Date();
  const activeLicenses = licenses.filter((l) => l.status === "active" && (!l.expirationDate || l.expirationDate > now)).length;

  // Same maths as "My Services & Billing" so both pages show identical totals.
  let balanceDue = 0;
  let totalPaid = 0;
  for (const lic of licenses) {
    const fin = getLicenseFinancials(lic, lic.transactions);
    balanceDue += fin.balanceDue;
    totalPaid += fin.totalPaid;
  }
  for (const req of requests) {
    balanceDue += (req.totalAmount || 0) - (req.paidAmount || 0);
    totalPaid += req.paidAmount || 0;
  }
  const firstName = clerkUser?.firstName || clerkUser?.fullName?.split(" ")[0] || "there";

  const stats = [
    { label: "Active requests", value: activeRequests, href: "/dashboard/user/requests", icon: ClipboardDocumentListIcon },
    { label: "Active licenses", value: activeLicenses, href: "/dashboard/user/revenuepro", icon: KeyIcon },
    { label: "Balance due", value: formatBdt(balanceDue), href: "/dashboard/user/requests", icon: WalletIcon },
    { label: "Total paid", value: formatBdt(totalPaid), href: "/dashboard/user/transactions", icon: BanknotesIcon },
  ];

  const products: { show: boolean; href: string; title: string; desc: string; cta: string; icon: typeof KeyIcon; tone: DashTone }[] = [
    {
      show: revenueProAllowed,
      href: "/dashboard/user/revenuepro",
      title: "Revenue Pro",
      desc: "Licenses, plugin downloads and live order insights for your WooCommerce store.",
      cta: "Open Revenue Pro",
      icon: CloudArrowDownIcon,
      tone: "emerald",
    },
    {
      show: bkashTrackerAllowed,
      href: "/dashboard/user/payment-gateway",
      title: "CodePay Gateway",
      desc: "Accept bKash, Nagad and bank payments with automatic TrxID verification.",
      cta: "Open CodePay",
      icon: DevicePhoneMobileIcon,
      tone: "teal",
    },
    {
      show: expenseTrackerAllowed,
      href: "/dashboard/user/expense-tracker",
      title: "Expense Tracker",
      desc: "Your MFS inflows and outflows, synced automatically from SMS.",
      cta: "Open tracker",
      icon: ChartPieIcon,
      tone: "indigo",
    },
  ].filter((p) => p.show);

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_80%_at_80%_0%,#000_30%,transparent_100%)]" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Client portal</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {firstName} 👋</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
              Track your projects, manage licenses and payments, and request new work — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/user/services"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(16_185_129/0.8)] transition hover:bg-emerald-400"
            >
              <PlusIcon className="h-4 w-4" /> Request a service
            </Link>
            <Link
              href="/dashboard/user/requests"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10"
            >
              My services
            </Link>
          </div>
        </div>

        <dl className="relative mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 lg:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="group bg-slate-950/80 p-4 transition hover:bg-slate-900 sm:p-5">
              <dt className="flex items-center gap-2 text-xs text-slate-400">
                <s.icon className="h-4 w-4 text-slate-500 group-hover:text-emerald-300" />
                {s.label}
              </dt>
              <dd className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{s.value}</dd>
            </Link>
          ))}
        </dl>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Your products</h2>
              <p className="text-sm text-slate-500">Tools enabled on your account</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => {
              const tone = toneClasses(p.tone);
              return (
                <Link key={p.href} href={p.href} className={`group relative flex flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${DASH_CARD}`}>
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar}`} />
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${tone.icon}`}>
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">{p.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                  <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${tone.text}`}>
                    {p.cta}
                    <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent requests */}
        <Panel
          title="Recent service requests"
          description="Status of your latest projects"
          action={<PanelLink href="/dashboard/user/requests">View all</PanelLink>}
          className="xl:col-span-2"
          bodyClassName=""
        >
          {requests.length === 0 ? (
            <EmptyState
              icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
              title="No requests yet"
              description="Tell us what you need — a WordPress plugin, a Shopify store or an AI automation."
              action={
                <Link href="/dashboard/user/services" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  <PlusIcon className="h-4 w-4" /> Request a service
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {requests.slice(0, 5).map((req) => {
                const due = Math.max(0, req.totalAmount - req.paidAmount);
                return (
                  <li key={req.id}>
                    <Link href={`/dashboard/user/requests/${req.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/70">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <ClipboardDocumentListIcon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{req.serviceType}</p>
                        <p className="truncate text-xs text-slate-500">
                          Requested {timeAgo(req.createdAt)}
                          {due > 0 && req.status !== "cancelled" ? ` · ${formatBdt(due)} due` : ""}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Shortcuts" bodyClassName="p-2">
            <QuickAction href="/dashboard/user/services" icon={<PlusIcon className="h-5 w-5" />} title="Get a service" description="WordPress, Shopify or AI automation" tone="emerald" />
            <QuickAction href="/dashboard/user/transactions" icon={<WalletIcon className="h-5 w-5" />} title="Billing & payments" description="Receipts and payment history" tone="violet" />
            <QuickAction href="/dashboard/user/tutorials" icon={<PlayCircleIcon className="h-5 w-5" />} title="Tutorials" description="Setup guides and videos" tone="sky" />
          </Panel>

          <a
            href="https://wa.me/8801570296656"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-[0_12px_30px_-12px_rgb(16_185_129/0.7)]"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
            <ChatBubbleLeftRightIcon className="relative h-6 w-6" />
            <p className="relative mt-3 font-semibold">Need help with anything?</p>
            <p className="relative mt-1 text-sm text-emerald-50">Message our team on WhatsApp — we usually reply within an hour.</p>
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
              Chat now <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>

      {/* Showcase */}
      {customers.length > 0 && (
        <Panel title="Featured network brands" description="Businesses powered by CodeBlend">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {customers.map((customer) => {
              const tile = (
                <div className="group flex h-24 flex-col items-center justify-center gap-2 rounded-xl bg-slate-50/70 px-3 ring-1 ring-slate-200/70 transition hover:bg-white hover:shadow-md">
                  <div className="flex h-9 w-full items-center justify-center">
                    {customer.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit logos of unknown size
                      <img
                        src={customer.logoUrl}
                        alt={customer.name}
                        className="max-h-9 max-w-[110px] object-contain opacity-80 brightness-[0.55] contrast-125 grayscale transition group-hover:opacity-100 group-hover:brightness-100 group-hover:contrast-100 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="w-full truncate text-center text-[11px] font-medium text-slate-500 group-hover:text-slate-900">{customer.name}</p>
                </div>
              );
              return customer.websiteUrl ? (
                <a key={customer.id} href={customer.websiteUrl} target="_blank" rel="noopener noreferrer" title={customer.name}>
                  {tile}
                </a>
              ) : (
                <div key={customer.id} title={customer.name}>{tile}</div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
