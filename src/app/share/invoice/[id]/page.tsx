import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SharePageControls from "@/components/SharePageControls";
import { getCurrencySymbol } from "@/lib/currency";

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string; download?: string }>;
}) {
  const { id } = await params;
  const { print, download } = await searchParams;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) return notFound();

  const isQuotation = invoice.type === "guest_quotation";
  const docTypeName = isQuotation ? "Quotation" : "Invoice";
  const docNumber = `${isQuotation ? "QT" : "INV"}-${invoice.id.slice(-8).toUpperCase()}`;
  const docDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();

  const sym = getCurrencySymbol(invoice.currency);

  const subtotal = invoice.amount;
  const totalPaid = isQuotation ? 0 : invoice.paid;
  const balanceDue = Math.max(0, subtotal - totalPaid);

  const shouldAutoPrint = print === "true";
  const shouldAutoDownload = download === "true";

  // Parse dynamic items list
  let itemsList: any[] = [];
  if (invoice.items && Array.isArray(invoice.items)) {
    itemsList = invoice.items;
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
        
        <SharePageControls
          docTypeName={docTypeName}
          docNumber={docNumber}
          autoDownload={shouldAutoDownload}
          autoPrint={shouldAutoPrint}
        />

        {/* Invoice Header */}
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
              Official Billing & Estimate Statement<br />
              contact@codeblend.co | Dhaka, Bangladesh
            </p>
          </div>

          <div className="sm:text-right">
            <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-wider">{docTypeName}</h1>
            <p className="text-xs text-slate-500 font-mono"><span className="font-bold text-slate-700">{docTypeName} #:</span> {docNumber}</p>
            <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Date:</span> {docDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
            {invoice.billingMonth && (() => {
              const [year, month] = invoice.billingMonth.split("-");
              const label = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
              return (
                <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Billing Month:</span> {label}</p>
              );
            })()}
          </div>
        </div>

        {/* Recipient & Issuer Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {isQuotation ? "Prepared For:" : "Billed To:"}
              </span>
              <span className="font-extrabold text-slate-900 text-sm leading-tight">{invoice.name}</span>
            </div>
            {invoice.address && (
              <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed mt-1 mb-1.5">
                {invoice.address}
              </p>
            )}
            {invoice.email && <p className="text-xs text-slate-500">✉️ {invoice.email}</p>}
            {invoice.phone && <p className="text-xs text-slate-500">📞 {invoice.phone}</p>}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Billed By:</span>
              <span className="font-extrabold text-slate-900 text-sm leading-tight">{invoice.preparedBy || "CodeBlend Digital Solutions"}</span>
            </div>
            <p className="text-xs text-slate-500">✉️ {invoice.preparedByEmail || "contact@codeblend.co"}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            {itemsList.length > 0 ? (
              // Multi-item columns
              <tr className="border-b-2 border-slate-200 text-xs uppercase text-slate-400 font-black tracking-wider">
                <th className="pb-3 text-left">Item Description</th>
                <th className="pb-3 text-center w-20">Qty / Hrs</th>
                <th className="pb-3 text-right w-24">Rate</th>
                <th className="pb-3 text-right w-28">Total</th>
              </tr>
            ) : (
              // Backward-compatible columns
              <tr className="border-b-2 border-slate-200 text-xs uppercase text-slate-400 font-black tracking-wider">
                <th className="pb-3 w-3/4">Item Description</th>
                <th className="pb-3 text-right">Price</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {itemsList.length > 0 ? (
              itemsList.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 align-top text-slate-800 font-medium">
                    {item.description}
                  </td>
                  <td className="py-4 text-center align-top text-slate-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right align-top text-slate-500 font-mono">
                    {sym}{(parseFloat(item.rate) || 0).toFixed(2)}
                  </td>
                  <td className="py-4 font-bold text-slate-900 text-right align-top whitespace-nowrap font-mono">
                    {sym}{(parseFloat(item.amount) || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              // Backward compatibility row
              <tr>
                <td className="py-4 align-top text-slate-800 font-medium">
                  {invoice.title}
                </td>
                <td className="py-4 font-bold text-slate-900 text-right align-top whitespace-nowrap font-mono">
                  {sym}{invoice.amount.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-end pr-2 mb-10">
          <div className="w-72 space-y-2">
            <div className="flex justify-between py-1.5 text-xs text-slate-600 border-b border-slate-100 font-medium">
              <span>{isQuotation ? "Estimated Cost:" : "Total Invoiced:"}</span>
              <span className="font-extrabold text-slate-800 font-mono">{sym}{subtotal.toFixed(2)}</span>
            </div>
            {!isQuotation && (
              <>
                <div className="flex justify-between py-1.5 text-xs border-b border-slate-100 font-medium">
                  <span className="text-slate-600">Total Paid:</span>
                  <span className="font-extrabold text-emerald-600 font-mono">- {sym}{totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-black">
                  <span className="text-slate-900">Balance Due:</span>
                  <span className={`font-mono ${balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {sym}{balanceDue.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Information / Bank Details */}
        {invoice.paymentDetails && (
          <div className="mb-8 p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span>💳</span> Payment Information / Bank Details:
            </h4>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono font-medium">
              {invoice.paymentDetails}
            </p>
          </div>
        )}

        {/* Custom Notes Section */}
        {invoice.notes && (
          <div className="mb-10 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notes / Terms:</h4>
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Thank you for trusting CodeBlend. For inquiries or questions, please contact contact@codeblend.co.
          </p>
        </div>

      </div>
    </div>
  );
}
