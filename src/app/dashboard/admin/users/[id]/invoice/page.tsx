import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLicenseFinancials } from "../page";

export default async function AdminUserInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    type?: string;
    itemId?: string;
    title?: string;
    amount?: string;
    paid?: string;
    notes?: string;
  }>;
}) {
  const user = await currentUser();
  const { id } = await params;

  if (!user || (user.id !== id && user.publicMetadata?.role !== "admin")) {
    redirect("/dashboard/user");
  }
  const { type = "statement", itemId, title: customTitle, amount: customAmountStr, paid: customPaidStr, notes: customNotes } = await searchParams;

  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) return notFound();

  let invoiceTitle = "Official Invoice";
  let invoiceNumber = `INV-${targetUser.id.slice(-8).toUpperCase()}`;
  let invoiceDate = new Date();
  
  let lineItems: Array<{
    title: string;
    details?: string;
    amount: number;
    paid: number;
    status: string;
  }> = [];

  let subtotal = 0;
  let totalPaid = 0;
  let balanceDue = 0;

  if (customTitle && customAmountStr !== undefined) {
    // Custom Generated Invoice
    invoiceTitle = "Official Custom Invoice";
    subtotal = parseFloat(customAmountStr) || 0;
    totalPaid = parseFloat(customPaidStr || "0") || 0;
    balanceDue = Math.max(0, subtotal - totalPaid);

    lineItems.push({
      title: customTitle,
      details: customNotes ? `Notes: ${customNotes}` : undefined,
      amount: subtotal,
      paid: totalPaid,
      status: balanceDue === 0 ? "Paid" : totalPaid > 0 ? "Partial Paid" : "Unpaid",
    });

  } else if (type === "license" && itemId) {
    const license = await prisma.license.findUnique({
      where: { id: itemId },
      include: { transactions: true },
    });
    if (!license) return notFound();

    invoiceTitle = "Service Subscription Invoice";
    invoiceNumber = `INV-LIC-${license.id.slice(-6).toUpperCase()}`;
    if (license.createdAt) invoiceDate = new Date(license.createdAt);

    const fin = getLicenseFinancials(license, license.transactions);
    
    subtotal = customAmountStr ? parseFloat(customAmountStr) : fin.payableAmount;
    totalPaid = customPaidStr ? parseFloat(customPaidStr) : fin.totalPaid;
    balanceDue = Math.max(0, subtotal - totalPaid);

    lineItems.push({
      title: customTitle || `RevenuePro WooCommerce Plugin Subscription (${license.domain})`,
      details: customNotes || `Plan Tier: ${license.tier || "Standard"} | Domain Binding: ${license.domain} | Status: ${license.status}`,
      amount: subtotal,
      paid: totalPaid,
      status: fin.isFreeOrTrial ? "Free Trial" : balanceDue === 0 ? "Paid" : totalPaid > 0 ? "Partial Paid" : "Unpaid",
    });

  } else if (type === "service" && itemId) {
    const sr = await prisma.serviceRequest.findUnique({
      where: { id: itemId },
      include: { transactions: true },
    });
    if (!sr) return notFound();

    invoiceTitle = "Service Order Invoice";
    invoiceNumber = `INV-SRV-${sr.id.slice(-6).toUpperCase()}`;
    if (sr.createdAt) invoiceDate = new Date(sr.createdAt);

    subtotal = customAmountStr ? parseFloat(customAmountStr) : (sr.totalAmount || 0);
    totalPaid = customPaidStr ? parseFloat(customPaidStr) : (sr.paidAmount || 0);
    balanceDue = Math.max(0, subtotal - totalPaid);

    lineItems.push({
      title: customTitle || `Custom Service: ${sr.serviceType}`,
      details: customNotes || `Website: ${sr.websiteUrl || "N/A"} ${sr.message ? `| Requirement: ${sr.message}` : ""}`,
      amount: subtotal,
      paid: totalPaid,
      status: sr.status,
    });

  } else if (type === "transaction" && itemId) {
    const tx = await prisma.paymentTransaction.findUnique({
      where: { id: itemId },
      include: { license: true, serviceRequest: true },
    });
    if (!tx) return notFound();

    invoiceTitle = "Payment Receipt";
    invoiceNumber = `REC-${(tx.transactionId || tx.id).slice(-8).toUpperCase()}`;
    if (tx.createdAt) invoiceDate = new Date(tx.createdAt);

    subtotal = customAmountStr ? parseFloat(customAmountStr) : tx.amount;
    totalPaid = customPaidStr ? parseFloat(customPaidStr) : (tx.status === "verified" || tx.status === "completed" ? tx.amount : 0);
    balanceDue = Math.max(0, subtotal - totalPaid);

    const targetDesc = tx.license
      ? `RevenuePro Plugin Subscription for ${tx.license.domain}`
      : tx.serviceRequest
      ? `Custom Service Order: ${tx.serviceRequest.serviceType}`
      : "General System Payment";

    lineItems.push({
      title: customTitle || `Payment Receipt (${tx.paymentMethod.toUpperCase()})`,
      details: customNotes || `Target: ${targetDesc} | Transaction ID: ${tx.transactionId || tx.id} | Sender: ${tx.senderNumber || "N/A"}`,
      amount: subtotal,
      paid: totalPaid,
      status: tx.status,
    });

  } else {
    // Statement overview: SHOW ONLY PAYABLE SERVICES
    invoiceTitle = "Account Statement Invoice";
    const licenses = await prisma.license.findMany({
      where: { userId: id },
      include: { transactions: true },
    });
    const services = await prisma.serviceRequest.findMany({
      where: { applicantId: id },
      include: { transactions: true },
    });

    licenses.forEach((lic) => {
      const fin = getLicenseFinancials(lic, lic.transactions);
      if (!fin.isFreeOrTrial && fin.payableAmount > 0) {
        subtotal += fin.payableAmount;
        totalPaid += fin.totalPaid;

        lineItems.push({
          title: `RevenuePro WooCommerce Subscription (${lic.domain})`,
          details: `Plan Tier: ${lic.tier} | Status: ${lic.status}`,
          amount: fin.payableAmount,
          paid: fin.totalPaid,
          status: lic.paymentStatus === "paid" ? "Paid" : "Unpaid",
        });
      }
    });

    services.forEach((sr) => {
      const tot = sr.totalAmount || 0;
      const pd = sr.paidAmount || 0;
      if (tot > 0) {
        subtotal += tot;
        totalPaid += pd;

        lineItems.push({
          title: `Custom Service Order: ${sr.serviceType}`,
          details: `Website: ${sr.websiteUrl || "N/A"} | Status: ${sr.status}`,
          amount: tot,
          paid: pd,
          status: sr.status,
        });
      }
    });

    balanceDue = Math.max(0, subtotal - totalPaid);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans print:p-0 print:bg-white text-slate-800">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .invoice-card {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}} />

      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-md rounded-2xl border border-slate-200 invoice-card">
        {/* Controls (Hidden on Print) */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 print:hidden">
          <Link 
            href={user.publicMetadata?.role === "admin" ? `/dashboard/admin/users/${id}` : "/dashboard/user/requests"}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition no-underline shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <button 
            id="print-btn"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download / Print PDF
          </button>
        </div>

        {/* Invoice Header (Consistent CodeBlend Branding) */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 border-b border-slate-200 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                C
              </div>
              <div>
                <div className="font-extrabold text-xl text-slate-900 leading-tight">CodeBlend</div>
                <div className="text-xs text-slate-500 font-semibold">Digital Solutions</div>
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Official Billing & Payment Receipt<br />
              Email: contact@codeblend.co | Dhaka, Bangladesh
            </p>
          </div>

          <div className="sm:text-right">
            <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-wider">{invoiceTitle}</h1>
            <p className="text-xs text-slate-500 font-mono"><span className="font-bold text-slate-700">Invoice #:</span> {invoiceNumber}</p>
            <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Date:</span> {invoiceDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
        </div>

        {/* Billed To Customer Info */}
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billed To:</h3>
          <p className="font-extrabold text-slate-900 text-sm">{targetUser.name || "Valued Merchant"}</p>
          <p className="text-xs text-slate-600 font-medium">✉️ {targetUser.email}</p>
          {targetUser.phone && <p className="text-xs text-slate-600 font-medium">📞 {targetUser.phone}</p>}
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 text-xs uppercase text-slate-400 font-black tracking-wider">
              <th className="pb-3 w-3/5">Item Description</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {lineItems.length > 0 ? (
              lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 align-top">
                    <div className="font-bold text-slate-800">{item.title}</div>
                    {item.details && (
                      <div className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{item.details}</div>
                    )}
                  </td>
                  <td className="py-4 text-center align-top whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-slate-900 text-right align-top whitespace-nowrap">
                    ৳{item.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-400 font-semibold">
                  No payable service items found for this statement.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Financial Summary Breakdown */}
        <div className="flex justify-end pr-2 mb-10">
          <div className="w-72 space-y-2">
            <div className="flex justify-between py-1.5 text-xs text-slate-600 border-b border-slate-100 font-medium">
              <span>Total Invoiced:</span>
              <span className="font-extrabold text-slate-800">৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs border-b border-slate-100 font-medium">
              <span className="text-slate-600">Total Paid:</span>
              <span className="font-extrabold text-emerald-600">- ৳{totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-base font-black border-t border-slate-200">
              <span className="text-slate-900">Balance Due:</span>
              <span className={balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}>
                ৳{balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Thank you for trusting CodeBlend. For support or billing inquiries, please contact contact@codeblend.co.
          </p>
        </div>

        {/* Print Handler */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('#print-btn');
            if (btn) {
              window.print();
            }
          });
        `}} />
      </div>
    </div>
  );
}
