import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-4 p-8 md:p-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">💳</span> Billing & Payments
        </h1>
        <p className="text-slate-500 text-sm">View your payment history and transaction status.</p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">For</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-medium">{trx.createdAt.toLocaleDateString("bn-BD")}</td>
                    <td className="py-4 px-4 font-mono">{trx.transactionId || "N/A"}</td>
                    <td className="py-4 px-4 uppercase text-xs font-bold text-slate-400">
                      {trx.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="py-4 px-4">
                      {trx.license && <span className="font-semibold">{trx.license.domain}</span>}
                      {trx.serviceRequest && <span className="font-semibold">{trx.serviceRequest.serviceType}</span>}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex px-2 py-1 rounded text-[0.6rem] font-bold uppercase tracking-wider
                        ${trx.status === "verified" || trx.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          trx.status === "pending" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"}`}
                      >
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
