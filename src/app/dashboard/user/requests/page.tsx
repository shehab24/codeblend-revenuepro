import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownTrayIcon, BanknotesIcon, ClipboardDocumentListIcon, ServerStackIcon, WalletIcon } from "@heroicons/react/24/outline";
import { getLicenseFinancials } from "@/lib/licenseFinancials";
import { DASH_BTN, PageHeader, StatCard } from "@/components/dashboard/ui";

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

  const invoices = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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
    <div className="space-y-6 pb-12 text-slate-800">
      <PageHeader
        eyebrow="Workspace"
        title="My services & billing"
        description="Your enrolled servers, custom service requests, balances and official invoices."
        icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        actions={
          <Link href={`/dashboard/admin/users/${userId}/invoice?type=statement`} className={DASH_BTN.primary}>
            <ArrowDownTrayIcon className="h-4 w-4" /> Statement invoice
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Enrolled servers" value={licenses.length} hint="License subscriptions" icon={<ServerStackIcon className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Service orders" value={requests.length} hint="Custom requests" icon={<ClipboardDocumentListIcon className="h-5 w-5" />} tone="sky" />
        <StatCard
          label="Balance due"
          value={<span className={totalOverallDue > 0 ? "text-rose-600" : ""}>৳{totalOverallDue.toFixed(2)}</span>}
          hint={totalOverallDue > 0 ? "Remaining balance" : "Account clear"}
          icon={<WalletIcon className="h-5 w-5" />}
          tone={totalOverallDue > 0 ? "rose" : "slate"}
        />
        <StatCard label="Total paid" value={`৳${totalOverallPaid.toFixed(2)}`} hint="Cleared payments" icon={<BanknotesIcon className="h-5 w-5" />} tone="violet" />
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
                        {invoices.some(
                          (inv) => inv.type === "license" && inv.itemId === lic.id
                        ) ? (
                          <Link
                            href={`/dashboard/admin/users/${userId}/invoice?type=license&itemId=${lic.id}`}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs no-underline inline-flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Invoice</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not Generated</span>
                        )}
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
                        {invoices.some(
                          (inv) => inv.type === "service" && inv.itemId === req.id
                        ) ? (
                          <Link
                            href={`/dashboard/user/requests/${req.id}/invoice`}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs no-underline inline-flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Invoice</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not Generated</span>
                        )}
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

      {/* 5. Custom / Additional Invoices */}
      {invoices.filter((inv) => inv.type === "custom").length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Custom & Additional Invoices</h3>
              <p className="text-xs text-slate-400 mt-0.5">Additional invoiced items and receipts.</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
              {invoices.filter((inv) => inv.type === "custom").length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Item / Description</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-right">Invoiced / Paid / Due</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {invoices
                  .filter((inv) => inv.type === "custom")
                  .map((inv) => {
                    const due = Math.max(0, inv.amount - inv.paid);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 font-semibold text-slate-800 text-sm">
                          <div>{inv.title}</div>
                          {inv.notes && <div className="text-[11px] text-slate-400 font-normal mt-0.5">Notes: {inv.notes}</div>}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          <div className="flex flex-col items-end text-xs">
                            <span className="text-slate-800">Invoiced: ৳{inv.amount.toFixed(2)}</span>
                            <span className="text-emerald-600 text-[11px]">Paid: ৳{inv.paid.toFixed(2)}</span>
                            {due > 0 ? (
                              <span className="text-red-500 font-bold text-[11px]">Due: ৳{due.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Due: ৳0.00</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Link
                            href={`/dashboard/admin/users/${userId}/invoice?type=custom&invoiceId=${inv.id}`}
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
        </div>
      )}
    </div>
  );
}
