import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowDownTrayIcon, BanknotesIcon, CheckCircleIcon, ClockIcon, WalletIcon } from "@heroicons/react/24/outline";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge, TABLE, formatBdt } from "@/components/dashboard/ui";

export const metadata = {
  title: "Billing & Payments | CodeBlend",
};

export default async function UserTransactionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const transactions = await prisma.paymentTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      license: true,
      serviceRequest: true,
    }
  });

  const verified = transactions.filter((t) => t.status === "verified" || t.status === "completed");
  const pending = transactions.filter((t) => t.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Billing & payments"
        description="Your payment history, verification status and downloadable receipts."
        icon={<WalletIcon className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total paid" value={formatBdt(verified.reduce((s, t) => s + t.amount, 0))} icon={<BanknotesIcon className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Verified payments" value={verified.length} icon={<CheckCircleIcon className="h-5 w-5" />} tone="sky" />
        <StatCard label="Awaiting verification" value={pending.length} icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
      </div>

      <Panel title="Payment history" description={`${transactions.length} transactions`} bodyClassName="">
        {transactions.length === 0 ? (
          <EmptyState icon={<WalletIcon className="h-6 w-6" />} title="No payment history found" description="Payments for licenses and services will appear here." />
        ) : (
          <div className={TABLE.wrap}>
            <table className={TABLE.table}>
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={TABLE.th}>Date</th>
                  <th className={TABLE.th}>Transaction ID</th>
                  <th className={TABLE.th}>Method</th>
                  <th className={TABLE.th}>For</th>
                  <th className={`${TABLE.th} text-right`}>Amount</th>
                  <th className={TABLE.th}>Status</th>
                  <th className={`${TABLE.th} text-center`}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id} className={TABLE.tr}>
                    <td className={`${TABLE.td} whitespace-nowrap font-medium`}>{trx.createdAt.toLocaleDateString("bn-BD")}</td>
                    <td className={`${TABLE.td} font-mono text-xs`}>{trx.transactionId || "—"}</td>
                    <td className={`${TABLE.td} text-xs font-semibold uppercase text-slate-500`}>{trx.paymentMethod.replace(/_/g, " ")}</td>
                    <td className={TABLE.td}>
                      {trx.license && <span className="font-medium text-slate-900">{trx.license.domain}</span>}
                      {trx.serviceRequest && <span className="font-medium text-slate-900">{trx.serviceRequest.serviceType}</span>}
                      {!trx.license && !trx.serviceRequest && <span className="italic text-slate-400">General payment</span>}
                    </td>
                    <td className={`${TABLE.td} whitespace-nowrap text-right font-semibold text-slate-900`}>৳{trx.amount.toFixed(2)}</td>
                    <td className={TABLE.td}><StatusBadge status={trx.status} /></td>
                    <td className={`${TABLE.td} text-center`}>
                      <Link
                        href={`/dashboard/admin/users/${userId}/invoice?type=transaction&itemId=${trx.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
