import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

function getLicenseFinancials(
  license: { id: string; tier?: string | null; paymentStatus: string },
  transactions: Array<{ licenseId?: string | null; amount: number; status: string }> = []
) {
  const tier = license.tier || "";
  const tLower = tier.toLowerCase();

  const isFreeOrTrial =
    tLower.includes("trial") ||
    tLower.includes("free") ||
    tLower.includes("dev") ||
    tLower.includes("test") ||
    tLower.includes("1 day") ||
    tLower.includes("2 min") ||
    tLower.includes("5 min") ||
    tLower.includes("5 day") ||
    tLower.includes("15 day") ||
    tLower.includes("lifetime") ||
    tier === "0";

  let payableAmount = 0;
  if (!isFreeOrTrial) {
    if (tLower.includes("yearly") || tLower.includes("elite") || tLower.includes("1 year") || tLower.includes("12 month")) {
      payableAmount = 2999;
    } else if (tLower.includes("biannual") || tLower.includes("6 month") || tLower.includes("6m")) {
      payableAmount = 1499;
    } else if (tLower.includes("quarterly") || tLower.includes("3 month")) {
      payableAmount = 749;
    } else if (tLower.includes("2 month")) {
      payableAmount = 499;
    } else if (tLower.includes("monthly") || tLower.includes("basic") || tLower.includes("1 month")) {
      payableAmount = 249;
    } else {
      payableAmount = 249;
    }
  }

  const txPaid = transactions
    .filter((tx) => tx.licenseId === license.id && (tx.status === "verified" || tx.status === "completed"))
    .reduce((sum, tx) => sum + tx.amount, 0);

  let totalPaid = txPaid;
  if (license.paymentStatus === "paid" && totalPaid < payableAmount) {
    totalPaid = payableAmount;
  }

  const balanceDue = isFreeOrTrial ? 0 : Math.max(0, payableAmount - totalPaid);

  return {
    isFreeOrTrial,
    payableAmount,
    totalPaid,
    balanceDue,
  };
}

export default async function UserRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Fetch Service Requests and Server Licenses for this merchant
  const requests = await prisma.serviceRequest.findMany({
    where: { applicantId: userId },
    orderBy: { createdAt: "desc" },
  });

  const licenses = await prisma.license.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Calculate License Financials
  let totalLicenseInvoiced = 0;
  let totalLicensePaid = 0;
  let totalLicenseDue = 0;

  licenses.forEach((lic) => {
    const fin = getLicenseFinancials(lic, lic.transactions);
    totalLicenseInvoiced += fin.payableAmount;
    totalLicensePaid += fin.totalPaid;
    totalLicenseDue += fin.balanceDue;
  });

  // Calculate Service Request Financials
  const totalServiceInvoiced = requests.reduce(
    (sum, req) => sum + (req.totalAmount || 0),
    0
  );
  const totalServicePaid = requests.reduce(
    (sum, req) => sum + (req.paidAmount || 0),
    0
  );
  const totalServiceDue = totalServiceInvoiced - totalServicePaid;

  const totalOverallDue = totalLicenseDue + totalServiceDue;
  const totalOverallPaid = totalLicensePaid + totalServicePaid;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-800 pb-12">
      {/* 1. Header Card (Matching RevenuePro Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">My Services & Billing</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your enrolled servers, custom service requests, due balances, and download official invoices.
          </p>
        </div>

        <Link
          href={`/dashboard/admin/users/${userId}/invoice?type=statement`}
          className="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all no-underline shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Statement Invoice</span>
        </Link>
      </div>

      {/* 2. Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Enrolled Servers</span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{licenses.length}</div>
            <p className="text-xs text-slate-400 mt-1">Active subscriptions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Service Orders</span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{requests.length}</div>
            <p className="text-xs text-slate-400 mt-1">Custom tickets</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Due Balance</span>
          <div className="mt-3">
            <div className={`text-3xl font-extrabold ${totalOverallDue > 0 ? "text-red-600" : "text-slate-900"}`}>
              ৳{totalOverallDue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalOverallDue > 0 ? "Remaining balance" : "Account clear"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Paid</span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">৳{totalOverallPaid.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Cleared payments</p>
          </div>
        </div>
      </div>

      {/* 3. Enrolled Server Subscriptions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Enrolled Server Subscriptions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Active plugin licenses and server domains.</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
            {licenses.length} Total
          </span>
        </div>

        {licenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Server / Domain</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Subscription & Expiration</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-right">Invoiced / Paid / Due</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {licenses.map((lic) => {
                  const fin = getLicenseFinancials(lic, lic.transactions);

                  return (
                    <tr key={lic.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">
                            {lic.domain}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            Created: {new Date(lic.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {lic.tier || "Standard"}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                              lic.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {lic.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Expires: {lic.expirationDate ? new Date(lic.expirationDate).toLocaleDateString() : "Lifetime"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-right font-semibold">
                        <div className="flex flex-col items-end text-xs">
                          <span className="text-slate-800 font-semibold">
                            Invoiced: {fin.isFreeOrTrial ? "৳0.00 (Free)" : `৳${fin.payableAmount.toFixed(2)}`}
                          </span>
                          <span className="text-emerald-600 font-semibold text-[11px]">
                            Paid: ৳{fin.totalPaid.toFixed(2)}
                          </span>
                          {fin.balanceDue > 0 ? (
                            <span className="text-red-500 font-bold text-[11px]">
                              Due: ৳{fin.balanceDue.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Due: ৳0.00
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <Link
                          href={`/dashboard/admin/users/${userId}/invoice?type=license&itemId=${lic.id}`}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs no-underline inline-flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Invoice</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No enrolled server subscriptions found.
          </div>
        )}
      </div>

      {/* 4. Custom Products & Service Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Products & Custom Service Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track developer service tickets and custom builds.</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
            {requests.length} Total
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Service / Product</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Status & Delivery</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-right">Invoiced / Paid / Due</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {requests.map((req) => {
                  const totalAmount = req.totalAmount || 0;
                  const paidAmount = req.paidAmount || 0;
                  const dueAmount = Math.max(0, totalAmount - paidAmount);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">
                            {req.serviceType}
                          </span>
                          {req.websiteUrl ? (
                            <a
                              href={req.websiteUrl.startsWith("http") ? req.websiteUrl : `https://${req.websiteUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-600 hover:underline font-semibold mt-0.5"
                            >
                              {req.websiteUrl}
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic mt-0.5">No website link</span>
                          )}
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            Submitted: {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider w-fit ${
                            req.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : req.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {req.status}
                          </span>
                          {req.deliveryDate && (
                            <span className="text-[11px] text-slate-400">
                              Delivery: {new Date(req.deliveryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right font-semibold">
                        <div className="flex flex-col items-end text-xs">
                          <span className="text-slate-800">
                            Invoiced: ৳{totalAmount.toFixed(2)}
                          </span>
                          <span className="text-emerald-600 text-[11px]">
                            Paid: ৳{paidAmount.toFixed(2)}
                          </span>
                          {dueAmount > 0 ? (
                            <span className="text-red-500 font-bold text-[11px]">
                              Due: ৳{dueAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Due: ৳0.00
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <Link
                          href={`/dashboard/user/requests/${req.id}/invoice`}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs no-underline inline-flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Invoice</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No service requests submitted yet.
          </div>
        )}
      </div>
    </div>
  );
}
