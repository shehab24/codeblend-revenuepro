import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="text-3xl">💳</span> All Transactions
            </h1>
            <p className="text-slate-500 text-sm">System-wide payment history.</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-500">Total Records</div>
            <div className="text-2xl font-bold text-emerald-600">{transactions.length}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="py-3 px-4 rounded-tl-lg">Date</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Method & Sender</th>
                <th className="py-3 px-4">Related Item</th>
                <th className="py-3 px-4 text-right rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-medium">{trx.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="py-4 px-4">
                      {trx.user ? (
                        <>
                          <div className="font-bold text-slate-700">{trx.user.name || "Unknown"}</div>
                          <div className="text-xs text-slate-400">{trx.user.email}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No User</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-700">{trx.transactionId || "N/A"}</td>
                    <td className="py-4 px-4">
                      <div className="uppercase text-xs font-bold text-slate-400">{trx.paymentMethod.replace("_", " ")}</div>
                      {trx.senderNumber && <div className="text-xs text-slate-500">{trx.senderNumber}</div>}
                    </td>
                    <td className="py-4 px-4">
                      {trx.license && (
                        <div>
                          <div className="font-bold text-emerald-600">License</div>
                          <div className="text-xs text-slate-500">{trx.license.domain}</div>
                        </div>
                      )}
                      {trx.serviceRequest && (
                        <div>
                          <div className="font-bold text-blue-600">Service</div>
                          <div className="text-xs text-slate-500">{trx.serviceRequest.serviceType}</div>
                        </div>
                      )}
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
