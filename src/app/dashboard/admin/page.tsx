import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  BanknotesIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentPlusIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SignalIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import {
  DASH_BTN,
  EmptyState,
  PageHeader,
  Panel,
  PanelLink,
  QuickAction,
  StatCard,
  StatusBadge,
  TABLE,
  formatBdt,
  timeAgo,
} from "@/components/dashboard/ui";

const PAID_STATUSES = ["completed", "verified"];

export default async function AdminDashboard() {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    usersCount,
    newUsers,
    licensesCount,
    activeLicenses,
    expiringSoon,
    openRequests,
    pendingRequests,
    revenueAll,
    revenueMonth,
    pendingPayments,
    logs24h,
    failed24h,
    recentLogs,
    recentRequests,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.license.count(),
    prisma.license.count({ where: { status: "active", OR: [{ expirationDate: null }, { expirationDate: { gt: now } }] } }),
    prisma.license.count({ where: { status: "active", expirationDate: { gt: now, lte: inSevenDays } } }),
    prisma.serviceRequest.count({ where: { status: { in: ["pending", "in_progress"] } } }),
    prisma.serviceRequest.count({ where: { status: "pending" } }),
    prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { status: { in: PAID_STATUSES } } }),
    prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { status: { in: PAID_STATUSES }, createdAt: { gte: monthStart } } }),
    prisma.paymentTransaction.count({ where: { status: "pending" } }),
    prisma.verificationLog.count({ where: { timestamp: { gte: dayAgo } } }),
    prisma.verificationLog.count({ where: { timestamp: { gte: dayAgo }, status: { not: "success" } } }),
    prisma.verificationLog.findMany({ take: 6, orderBy: { timestamp: "desc" }, include: { license: { select: { domain: true } } } }),
    prisma.serviceRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { applicant: { select: { name: true, email: true } } },
    }),
    prisma.paymentTransaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const successRate = logs24h > 0 ? Math.round(((logs24h - failed24h) / logs24h) * 100) : null;
  const firstName = user.firstName || user.fullName?.split(" ")[0] || "Admin";
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin console"
        title={`${greeting}, ${firstName}`}
        description="Here's what's happening across licenses, customers and payments today."
        icon={<Squares2X2Icon className="h-6 w-6" />}
        actions={
          <>
            <Link href="/dashboard/admin/invoices/create" className={DASH_BTN.secondary}>
              <DocumentPlusIcon className="h-4 w-4" /> New invoice
            </Link>
            <Link href="/dashboard/admin/licenses" className={DASH_BTN.primary}>
              <KeyIcon className="h-4 w-4" /> Manage licenses
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={usersCount.toLocaleString()}
          hint={`+${newUsers} in the last 30 days`}
          icon={<UsersIcon className="h-5 w-5" />}
          tone="sky"
          href="/dashboard/admin/users"
        />
        <StatCard
          label="Active licenses"
          value={`${activeLicenses} / ${licensesCount}`}
          hint={expiringSoon > 0 ? `${expiringSoon} expiring within 7 days` : "None expiring this week"}
          icon={<KeyIcon className="h-5 w-5" />}
          tone="emerald"
          href="/dashboard/admin/licenses"
        />
        <StatCard
          label="Open service requests"
          value={openRequests}
          hint={`${pendingRequests} waiting for review`}
          icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
          tone="amber"
          href="/dashboard/admin/requests"
        />
        <StatCard
          label="Verified revenue"
          value={formatBdt(revenueAll._sum.amount ?? 0)}
          hint={`${formatBdt(revenueMonth._sum.amount ?? 0)} this month · ${pendingPayments} pending`}
          icon={<BanknotesIcon className="h-5 w-5" />}
          tone="violet"
          href="/dashboard/admin/transactions"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent requests */}
        <Panel
          title="Latest service requests"
          description="New and ongoing client work"
          action={<PanelLink href="/dashboard/admin/requests">View all</PanelLink>}
          className="xl:col-span-2"
          bodyClassName=""
        >
          {recentRequests.length === 0 ? (
            <EmptyState icon={<ClipboardDocumentListIcon className="h-6 w-6" />} title="No service requests yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentRequests.map((req) => {
                const who = req.applicant?.name || req.applicant?.email || req.contactEmail || "Guest";
                return (
                  <li key={req.id}>
                    <Link href={`/dashboard/admin/requests/${req.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/70">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {who.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{req.serviceType}</p>
                        <p className="truncate text-xs text-slate-500">{who} · {timeAgo(req.createdAt)}</p>
                      </div>
                      {req.totalAmount > 0 && (
                        <span className="hidden text-sm font-medium text-slate-700 sm:block">{formatBdt(req.totalAmount)}</span>
                      )}
                      <StatusBadge status={req.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Quick actions */}
        <Panel title="Quick actions" bodyClassName="p-2">
          <QuickAction href="/dashboard/admin/licenses" icon={<KeyIcon className="h-5 w-5" />} title="Create a license" description="Bind a key to a domain and user" tone="emerald" />
          <QuickAction href="/dashboard/admin/invoices/create" icon={<DocumentPlusIcon className="h-5 w-5" />} title="Invoice or quotation" description="Bill a guest or existing client" tone="sky" />
          <QuickAction href="/dashboard/admin/search" icon={<MagnifyingGlassIcon className="h-5 w-5" />} title="Search a number" description="Courier delivery history lookup" tone="violet" />
          <QuickAction href="/dashboard/admin/fraud-stats" icon={<ShieldCheckIcon className="h-5 w-5" />} title="Fraud statistics" description="Audit cached courier records" tone="rose" />
          <QuickAction href="/dashboard/admin/settings" icon={<Cog6ToothIcon className="h-5 w-5" />} title="Settings" description="Payments, pixel, downloads & reminders" tone="slate" />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent payments */}
        <Panel
          title="Recent payments"
          description="Latest transactions across licenses and services"
          action={<PanelLink href="/dashboard/admin/transactions">View all</PanelLink>}
          bodyClassName=""
        >
          {recentTransactions.length === 0 ? (
            <EmptyState icon={<BanknotesIcon className="h-6 w-6" />} title="No payments yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                    <BanknotesIcon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{tx.user?.name || tx.user?.email || tx.senderNumber || "Unknown payer"}</p>
                    <p className="truncate text-xs text-slate-500">
                      {tx.paymentMethod.replace(/_/g, " ")}
                      {tx.transactionId ? ` · ${tx.transactionId}` : ""} · {timeAgo(tx.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatBdt(tx.amount)}</span>
                  <StatusBadge status={tx.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Verifications */}
        <Panel
          title="API verifications"
          description={successRate === null ? "No pings in the last 24 hours" : `${logs24h} pings in 24h · ${successRate}% successful`}
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <SignalIcon className="h-3.5 w-3.5" /> Live
            </span>
          }
          bodyClassName=""
        >
          {recentLogs.length === 0 ? (
            <EmptyState icon={<SignalIcon className="h-6 w-6" />} title="No verifications yet" description="Plugin license checks will appear here." />
          ) : (
            <div className={TABLE.wrap}>
              <table className={TABLE.table}>
                <thead>
                  <tr>
                    <th className={TABLE.th}>Domain</th>
                    <th className={TABLE.th}>IP</th>
                    <th className={TABLE.th}>When</th>
                    <th className={TABLE.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className={TABLE.tr}>
                      <td className={`${TABLE.td} font-medium text-slate-900`}>{log.license.domain}</td>
                      <td className={`${TABLE.td} font-mono text-xs`}>{log.ipAddress || "—"}</td>
                      <td className={`${TABLE.td} whitespace-nowrap text-xs`}>{timeAgo(log.timestamp)}</td>
                      <td className={TABLE.td}><StatusBadge status={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
