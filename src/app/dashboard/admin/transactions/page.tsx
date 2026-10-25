import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BanknotesIcon, CheckCircleIcon, ClockIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge, TABLE, formatBdt } from "@/components/dashboard/ui";

export const metadata = {
  title: "All Transactions | Admin",
};

export default async function AdminTransactionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") {
    redirect("/dashboard/user");
  }

  const transactions = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      license: true,
      serviceRequest: true,
    }
  });

  const paid = transactions.filter((t) => t.status === "verified" || t.status === "completed");
  const pending = transactions.filter((t) => t.status === "pending");
  const paidTotal = paid.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Transactions"
        description="System-wide payment history for licenses and service requests."
        icon={<CreditCardIcon className="h-6 w-6" />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total records" value={transactions.length} icon={<CreditCardIcon className="h-5 w-5" />} tone="slate" />
        <StatCard label="Verified payments" value={paid.length} icon={<CheckCircleIcon className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Pending review" value={pending.length} icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
        <StatCard label="Verified amount" value={formatBdt(paidTotal)} icon={<BanknotesIcon className="h-5 w-5" />} tone="violet" />
      </div>

      <Panel title="Payment history" description={`${transactions.length} transactions`} bodyClassName="">
        {transactions.length === 0 ? (
          <EmptyState icon={<CreditCardIcon className="h-6 w-6" />} title="No payment history found" />
        ) : (
          <div className={TABLE.wrap}>
            <table className={TABLE.table}>
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={TABLE.th}>Date</th>
                  <th className={TABLE.th}>User</th>
                  <th className={TABLE.th}>Transaction ID</th>
                  <th className={TABLE.th}>Method & sender</th>
                  <th className={TABLE.th}>Related item</th>
                  <th className={`${TABLE.th} text-right`}>Amount</th>
                  <th className={`${TABLE.th} text-right`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id} className={TABLE.tr}>
                    <td className={`${TABLE.td} whitespace-nowrap`}>
                      {trx.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className={TABLE.td}>
                      {trx.user ? (
                        <>
                          <div className="font-medium text-slate-900">{trx.user.name || "Unknown"}</div>
                          <div className="text-xs text-slate-400">{trx.user.email}</div>
                        </>
                      ) : (
                        <span className="italic text-slate-400">No user</span>
                      )}
                    </td>
                    <td className={`${TABLE.td} font-mono text-xs font-semibold text-slate-700`}>{trx.transactionId || "—"}</td>
                    <td className={TABLE.td}>
                      <div className="text-xs font-semibold uppercase text-slate-500">{trx.paymentMethod.replace(/_/g, " ")}</div>
                      {trx.senderNumber && <div className="text-xs text-slate-400">{trx.senderNumber}</div>}
                    </td>
                    <td className={TABLE.td}>
                      {trx.license && (
                        <div>
                          <div className="text-xs font-semibold text-emerald-600">License</div>
                          <div className="text-xs text-slate-500">{trx.license.domain}</div>
                        </div>
                      )}
                      {trx.serviceRequest && (
                        <div>
                          <div className="text-xs font-semibold text-sky-600">Service</div>
                          <div className="text-xs text-slate-500">{trx.serviceRequest.serviceType}</div>
                        </div>
                      )}
                    </td>
                    <td className={`${TABLE.td} whitespace-nowrap text-right font-semibold text-slate-900`}>{formatBdt(trx.amount)}</td>
                    <td className={`${TABLE.td} text-right`}><StatusBadge status={trx.status} /></td>
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
