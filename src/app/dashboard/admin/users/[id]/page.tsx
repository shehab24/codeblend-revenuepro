import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  toggleLicensePaymentStatusFromAdmin,
  deleteServiceRequestFromAdmin,
} from "../actions";
import { AdminInvoiceModal } from "./AdminInvoiceModal";
import { EditServiceBillingModal } from "./EditServiceBillingModal";
import { DeleteConfirmButton } from "./DeleteConfirmButton";

export function getLicenseFinancials(
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

  if (txPaid > payableAmount) {
    payableAmount = txPaid;
    totalPaid = txPaid;
  }

  const balanceDue = isFreeOrTrial ? 0 : Math.max(0, payableAmount - totalPaid);

  return {
    isFreeOrTrial,
    payableAmount,
    totalPaid,
    balanceDue,
  };
}

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const { id } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      licenses: {
        orderBy: { createdAt: "desc" },
        include: {
          logs: {
            orderBy: { timestamp: "desc" },
            take: 5,
          },
          transactions: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      serviceRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!targetUser) {
    return notFound();
  }

  // Fetch transactions connected to user
  const userTransactions = await prisma.paymentTransaction.findMany({
    where: {
      OR: [
        { userId: id },
        { license: { userId: id } },
        { serviceRequest: { applicantId: id } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      license: true,
      serviceRequest: true,
    },
  });

  // Financial Calculations
  const totalServersCount = targetUser.licenses.length;
  const activeServersCount = targetUser.licenses.filter(
    (l) => l.status === "active"
  ).length;

  let totalLicenseInvoiced = 0;
  let totalLicensePaid = 0;
  let totalLicenseDue = 0;

  targetUser.licenses.forEach((l) => {
    const fin = getLicenseFinancials(l, l.transactions);
    totalLicenseInvoiced += fin.payableAmount;
    totalLicensePaid += fin.totalPaid;
    totalLicenseDue += fin.balanceDue;
  });

  const totalServiceRequestsCount = targetUser.serviceRequests.length;
  const totalServiceInvoiced = targetUser.serviceRequests.reduce(
    (sum, sr) => sum + (sr.totalAmount || 0),
    0
  );
  const totalServicePaid = targetUser.serviceRequests.reduce(
    (sum, sr) => sum + (sr.paidAmount || 0),
    0
  );
  const totalServiceDue = totalServiceInvoiced - totalServicePaid;

  const totalOverallDue = totalLicenseDue + totalServiceDue;
  const totalLifetimePaid = totalLicensePaid + totalServicePaid;

  const initials = targetUser.name
    ? targetUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : targetUser.email[0].toUpperCase();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800 pb-12">
      {/* 1. Header Card (Matching RevenuePro Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/users"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-600 shrink-0"
            title="Back to Users"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {targetUser.name || "Unnamed User"}
                </h1>
                {targetUser.role === "admin" || targetUser.role === "ADMIN" ? (
                  <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase bg-emerald-100 text-emerald-700 tracking-wider">
                    ADMIN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase bg-slate-100 text-slate-600 tracking-wider">
                    USER
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                <span>{targetUser.email}</span>
                {targetUser.phone && <span>• {targetUser.phone}</span>}
                <span className="text-slate-400 font-mono">ID: {targetUser.id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AdminInvoiceModal
            userId={targetUser.id}
            userName={targetUser.name}
            userEmail={targetUser.email}
            initialTitle="RevenuePro Subscription / Custom Service Invoice"
            initialAmount={totalOverallDue > 0 ? totalOverallDue : 249}
            initialPaid={totalLifetimePaid}
            triggerButtonText="+ Custom Invoice"
            triggerButtonClass="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
          />

          <Link
            href={`/dashboard/admin/users/${targetUser.id}/invoice?type=statement`}
            className="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all no-underline shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Statement Invoice</span>
          </Link>
        </div>
      </div>

      {/* 2. Overview Stats Cards (Matching Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Enrolled Servers</span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{totalServersCount}</div>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-600 font-semibold">{activeServersCount} Active</span> • {totalServersCount - activeServersCount} Inactive
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Service Requests</span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{totalServiceRequestsCount}</div>
            <p className="text-xs text-slate-400 mt-1">
              Invoiced: <span className="font-semibold text-slate-800">৳{totalServiceInvoiced.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Due Balance</span>
          <div className="mt-3">
            <div className={`text-3xl font-extrabold ${totalOverallDue > 0 ? "text-red-600" : "text-slate-900"}`}>
              ৳{totalOverallDue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalOverallDue > 0 ? "Outstanding balance" : "Account clear"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Paid</span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">৳{totalLifetimePaid.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">
              Lifetime receipts
            </p>
          </div>
        </div>
      </div>

      {/* 3. Feature Access Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Feature Access Privileges</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-md border font-semibold ${targetUser.downloadAllowed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
            Downloads: {targetUser.downloadAllowed ? "Allowed" : "Disabled"}
          </span>
          <span className={`px-2.5 py-1 rounded-md border font-semibold ${targetUser.expenseTrackerAllowed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
            Expense Tracker: {targetUser.expenseTrackerAllowed ? "Allowed" : "Disabled"}
          </span>
          <span className={`px-2.5 py-1 rounded-md border font-semibold ${targetUser.bkashTrackerAllowed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
            CodePay Gateway: {targetUser.bkashTrackerAllowed ? "Allowed" : "Disabled"}
          </span>
          <span className={`px-2.5 py-1 rounded-md border font-semibold ${targetUser.revenueProAllowed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
            RevenuePro: {targetUser.revenueProAllowed ? "Allowed" : "Disabled"}
          </span>
          <span className={`px-2.5 py-1 rounded-md border font-semibold ${targetUser.codepayActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
            API Status: {targetUser.codepayActive ? "Active" : "Blocked"}
          </span>
        </div>
      </div>

      {/* 4. Enrolled Servers & Subscriptions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enrolled Servers & Subscriptions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registered domain licenses bound to this merchant.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
            {targetUser.licenses.length} Total
          </span>
        </div>

        {targetUser.licenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Server / Domain</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Tier & Status</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-right">Invoiced / Paid / Due</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {targetUser.licenses.map((license) => {
                  const fin = getLicenseFinancials(license, license.transactions);

                  return (
                    <tr key={license.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{license.domain}</span>
                          <span className="text-[11px] text-slate-400">Created: {new Date(license.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {license.tier || "Standard"}
                            </span>

                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                              license.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {license.status}
                            </span>

                            {!fin.isFreeOrTrial && (
                              <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                                license.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}>
                                {license.paymentStatus}
                              </span>
                            )}
                          </div>

                          {!fin.isFreeOrTrial && (
                            <form action={toggleLicensePaymentStatusFromAdmin}>
                              <input type="hidden" name="licenseId" value={license.id} />
                              <input type="hidden" name="targetUserId" value={targetUser.id} />
                              <input
                                type="hidden"
                                name="paymentStatus"
                                value={license.paymentStatus === "paid" ? "unpaid" : "paid"}
                              />
                              <button
                                type="submit"
                                className="text-[10px] text-slate-400 hover:text-emerald-600 underline cursor-pointer"
                              >
                                {license.paymentStatus === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
                              </button>
                            </form>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end text-xs">
                          <span className="text-slate-800 font-semibold">
                            {fin.isFreeOrTrial ? "৳0.00 (Free)" : `৳${fin.payableAmount.toFixed(2)}`}
                          </span>
                          <span className="text-emerald-600 font-semibold text-[11px]">
                            Paid: ৳{fin.totalPaid.toFixed(2)}
                          </span>
                          {fin.balanceDue > 0 && (
                            <span className="text-red-500 font-bold text-[11px]">
                              Due: ৳{fin.balanceDue.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <AdminInvoiceModal
                          userId={targetUser.id}
                          userName={targetUser.name}
                          userEmail={targetUser.email}
                          initialTitle={`RevenuePro WooCommerce Plugin (${license.domain})`}
                          initialAmount={fin.payableAmount}
                          initialPaid={fin.totalPaid}
                          type="license"
                          itemId={license.id}
                          triggerButtonText="Invoice"
                          triggerButtonClass="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No servers or domain licenses currently enrolled.
          </div>
        )}
      </div>

      {/* 5. Products & Custom Service Orders (Cleaned without Note Clutter!) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Products & Custom Service Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Custom plugin development and technical service tickets.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
            {targetUser.serviceRequests.length} Total
          </span>
        </div>

        {targetUser.serviceRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Service / Product</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Status & Pricing</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-right">Invoiced / Paid / Due</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {targetUser.serviceRequests.map((sr) => {
                  const due = Math.max(0, (sr.totalAmount || 0) - (sr.paidAmount || 0));

                  return (
                    <tr key={sr.id} className="hover:bg-slate-50/50 transition">
                      {/* Product Title & Link Only (Notes removed) */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">
                            {sr.serviceType}
                          </span>
                          {sr.websiteUrl ? (
                            <a
                              href={sr.websiteUrl.startsWith("http") ? sr.websiteUrl : `https://${sr.websiteUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-600 hover:underline font-semibold mt-0.5"
                            >
                              {sr.websiteUrl}
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic mt-0.5">No website link</span>
                          )}
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            Submitted: {new Date(sr.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Status & Edit Pricing */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider w-fit ${
                            sr.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : sr.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {sr.status}
                          </span>
                          <EditServiceBillingModal
                            serviceRequestId={sr.id}
                            targetUserId={targetUser.id}
                            serviceType={sr.serviceType}
                            initialTotalAmount={sr.totalAmount || 0}
                            initialPaidAmount={sr.paidAmount || 0}
                            initialStatus={sr.status}
                          />
                        </div>
                      </td>

                      {/* Financials Breakdown */}
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end text-xs font-semibold">
                          <span className="text-slate-800">
                            Invoiced: ৳{(sr.totalAmount || 0).toFixed(2)}
                          </span>
                          <span className="text-emerald-600 text-[11px]">
                            Paid: ৳{(sr.paidAmount || 0).toFixed(2)}
                          </span>
                          {due > 0 ? (
                            <span className="text-red-500 font-bold text-[11px]">
                              Due: ৳{due.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Due: ৳0.00
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <AdminInvoiceModal
                            userId={targetUser.id}
                            userName={targetUser.name}
                            userEmail={targetUser.email}
                            initialTitle={`Custom Service Order: ${sr.serviceType}`}
                            initialAmount={sr.totalAmount || 0}
                            initialPaid={sr.paidAmount || 0}
                            type="service"
                            itemId={sr.id}
                            triggerButtonText="Invoice"
                            triggerButtonClass="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                          />

                          <DeleteConfirmButton
                            action={deleteServiceRequestFromAdmin}
                            idFieldName="serviceRequestId"
                            idValue={sr.id}
                            targetUserId={targetUser.id}
                            itemLabel="Service Request"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No products or custom service orders for this user.
          </div>
        )}
      </div>

      {/* 6. Payment Transaction Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payment Transaction Ledger</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete history of payments processed for license renewals and product requests.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
            {userTransactions.length} Total
          </span>
        </div>

        {userTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Time</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Trx ID / Gateway</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Target Item</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-right">Amount</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="p-3 text-xs font-semibold text-slate-400 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-800">
                          {tx.transactionId || tx.id.slice(0, 10)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          {tx.paymentMethod} {tx.senderNumber && `(${tx.senderNumber})`}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      {tx.license ? (
                        <span className="text-slate-700 font-semibold">Server: {tx.license.domain}</span>
                      ) : tx.serviceRequest ? (
                        <span className="text-slate-700 font-semibold">Service: {tx.serviceRequest.serviceType}</span>
                      ) : (
                        <span className="text-slate-400 italic">General Payment</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-extrabold text-slate-900">
                      ৳{tx.amount.toFixed(2)}
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                        tx.status === "verified" || tx.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <AdminInvoiceModal
                        userId={targetUser.id}
                        userName={targetUser.name}
                        userEmail={targetUser.email}
                        initialTitle={`Payment Receipt (${tx.paymentMethod.toUpperCase()})`}
                        initialAmount={tx.amount}
                        initialPaid={tx.status === "verified" || tx.status === "completed" ? tx.amount : 0}
                        type="transaction"
                        itemId={tx.id}
                        triggerButtonText="Invoice"
                        triggerButtonClass="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No payment transaction logs available.
          </div>
        )}
      </div>
    </div>
  );
}
