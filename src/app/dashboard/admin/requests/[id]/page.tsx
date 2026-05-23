import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminNoteThread } from "./AdminNoteThread";
import { AdminSendEmailModal } from "../AdminSendEmailModal";
import { adminUpdateServiceRequest } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Request Details — Admin | CodeBlend" };
}

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") redirect("/dashboard/user");

  const { id } = await params;

  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      applicant: true,
      notes: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!request) notFound();

  const totalAmount = request.totalAmount || 0;
  const paidAmount = request.paidAmount || 0;
  const dueAmount = totalAmount - paidAmount;

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const recipientEmail = request.applicant?.email || request.contactEmail || "";
  const recipientName = request.applicant?.name || "User";

  const notes = request.notes.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/dashboard/admin/requests"
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Requests
        </Link>
        {recipientEmail && (
          <AdminSendEmailModal
            recipientEmail={recipientEmail}
            recipientName={recipientName}
            requestId={request.id}
            serviceType={request.serviceType}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Request info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main info card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[request.status] || statusStyles.pending}`}>
                    {statusLabels[request.status] || "Pending"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Submitted {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(request.createdAt))}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{request.serviceType}</h1>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-1">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Customer</div>
              <div className="text-sm font-semibold text-slate-800">{recipientName}</div>
              <div className="text-sm text-slate-500">{recipientEmail}</div>
              {request.applicant?.phone && (
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-xs font-bold border border-sky-100">
                  📱 {request.applicant.phone}
                </div>
              )}
              {!request.applicant && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200">
                  WordPress Plugin User
                </span>
              )}
            </div>

            {/* Website URL */}
            {request.websiteUrl && (
              <div>
                <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Website URL</div>
                <a
                  href={request.websiteUrl.startsWith("http") ? request.websiteUrl : `https://${request.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1.5 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {request.websiteUrl}
                </a>
              </div>
            )}

            {/* Message */}
            <div>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Requirements</div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {request.message || <span className="italic text-slate-400">No requirements provided.</span>}
              </div>
            </div>
          </div>

          {/* Conversation */}
          <AdminNoteThread requestId={request.id} notes={notes} />
        </div>

        {/* Right: Manage panel */}
        <div className="space-y-6">
          {/* Billing summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-4">Billing Summary</div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-800">৳{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pb-3 border-b border-slate-100">
                <span className="text-slate-500">Paid Amount</span>
                <span className="font-bold text-emerald-600">৳{paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 text-sm">Total Due</span>
                <span className={`font-black text-base ${dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  ৳{dueAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Manage form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-4">Manage Request</div>
            <form action={adminUpdateServiceRequest} className="space-y-4">
              <input type="hidden" name="id" value={request.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  name="status"
                  defaultValue={request.status}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Expected Delivery</label>
                <input
                  type="date"
                  name="deliveryDate"
                  defaultValue={request.deliveryDate ? new Date(request.deliveryDate).toISOString().split("T")[0] : ""}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Total Amount (BDT)</label>
                <input
                  type="number"
                  name="totalAmount"
                  step="0.01"
                  defaultValue={request.totalAmount}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Paid Amount (BDT)</label>
                <input
                  type="number"
                  name="paidAmount"
                  step="0.01"
                  defaultValue={request.paidAmount}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition border-none cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
