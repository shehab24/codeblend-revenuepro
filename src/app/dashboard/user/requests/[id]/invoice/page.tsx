import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  if (!userId) redirect("/");

  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: { applicant: true },
  });

  if (!request) return notFound();
  
  // Allow admins or the applicant to view
  if (request.applicantId !== userId) {
    redirect("/dashboard/user/requests");
  }

  const totalAmount = request.totalAmount || 0;
  const paidAmount = request.paidAmount || 0;
  const dueAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans print:p-0 print:bg-white text-slate-800">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .invoice-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}} />
      <div className="max-w-3xl mx-auto bg-white p-12 shadow-sm rounded-xl invoice-page">
        
        {/* Controls (Hidden on Print) */}
        <div className="flex justify-between mb-8 print:hidden">
          <Link 
            href={`/dashboard/user/requests/${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition no-underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Details
          </Link>

          <button 
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition"
          >
            Download / Print PDF
          </button>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-12 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
                C
              </div>
              <div>
                <div className="font-bold text-xl text-slate-900 leading-tight">CodeBlend</div>
                <div className="text-xs text-slate-500 font-medium">Digital Solutions</div>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              info@codeblend.co<br />
              Dhaka, Bangladesh
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-200 mb-2 uppercase tracking-wide">Invoice</h1>
            <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Invoice:</span> #{request.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Date:</span> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-10">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To:</h3>
          <p className="font-semibold text-slate-800">{request.applicant?.name || "Customer"}</p>
          <p className="text-sm text-slate-500">{request.applicant?.email || request.contactEmail || "N/A"}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-10 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 text-sm">
              <th className="pb-3 text-slate-500 font-semibold w-2/3">Item Description</th>
              <th className="pb-3 text-slate-500 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-4 text-sm align-top">
                <div className="font-bold text-slate-800 mb-1">{request.serviceType}</div>
                {request.message && (
                  <div className="text-slate-500 whitespace-pre-wrap">{request.message}</div>
                )}
              </td>
              <td className="py-4 text-sm font-semibold text-slate-800 text-right align-top">
                ৳{totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end pr-4">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm border-b border-slate-100">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-800">৳{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-b border-slate-200">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-semibold text-emerald-600">-৳{paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold">
              <span className="text-slate-800">Total Due:</span>
              <span className={dueAmount > 0 ? "text-red-500" : "text-emerald-500"}>৳{dueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200">
          <p className="text-xs text-center text-slate-400">
            Thank you for trusting CodeBlend. If you have any questions about this invoice, please contact info@codeblend.co.
          </p>
        </div>

        {/* Small script to handle the button click without inline string issues in React */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('click', function(e) {
            if(e.target.innerText === 'Download / Print PDF') {
              window.print();
            }
          });
        `}} />
      </div>
    </div>
  );
}
