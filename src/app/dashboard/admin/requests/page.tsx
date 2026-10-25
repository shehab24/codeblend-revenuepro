import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminSendEmailModal } from "./AdminSendEmailModal";
import { RequestSearch } from "./RequestSearch";
import { ArrowPathIcon, BanknotesIcon, CheckCircleIcon, ClipboardDocumentListIcon, ClockIcon } from "@heroicons/react/24/outline";
import { DASH_CARD, PageHeader, StatCard, formatBdt } from "@/components/dashboard/ui";

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await currentUser();
  const { q } = await searchParams;
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const whereClause = q ? {
    OR: [
      { applicant: { name: { contains: q, mode: "insensitive" as const } } },
      { applicant: { email: { contains: q, mode: "insensitive" as const } } },
      { contactEmail: { contains: q, mode: "insensitive" as const } },
    ]
  } : {};

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { applicant: true },
    where: whereClause,
  });

  const counts = { pending: 0, in_progress: 0, completed: 0 } as Record<string, number>;
  let outstanding = 0;
  for (const r of requests) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
    if (r.status !== "cancelled") outstanding += Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0));
  }

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    in_progress: "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    cancelled: "bg-red-50 text-red-500 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Service requests"
        description="Review client requests, set pricing and status, and agree delivery dates."
        icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Pending" value={counts.pending} icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
        <StatCard label="In progress" value={counts.in_progress} icon={<ArrowPathIcon className="h-5 w-5" />} tone="sky" />
        <StatCard label="Completed" value={counts.completed} icon={<CheckCircleIcon className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Outstanding balance" value={formatBdt(outstanding)} icon={<BanknotesIcon className="h-5 w-5" />} tone="rose" />
      </div>

    <div className={`${DASH_CARD} p-6`}>
      <div className="mb-4 flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-950">{q ? `Results for “${q}”` : "All requests"}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{requests.length} requests</p>
        </div>
        <RequestSearch />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Customer</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Service</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Billing (Total / Due)</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Delivery</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? requests.map((req) => {
              const totalAmount = req.totalAmount || 0;
              const paidAmount = req.paidAmount || 0;
              const dueAmount = totalAmount - paidAmount;
              // Determine best email to use for this request
              const recipientEmail = req.applicant?.email || req.contactEmail || "";
              const recipientName = req.applicant?.name || "User";
              return (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-3 text-sm">
                    {req.applicant ? (
                      <>
                        <div className="font-semibold text-slate-800">{req.applicant.name || "N/A"}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{req.applicant.email}</div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-800">Plugin User</div>
                        <div className="text-xs text-slate-500 mt-0.5">{req.contactEmail}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200">
                          WordPress Plugin
                        </span>
                      </>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium text-slate-800">{req.serviceType}</div>
                    {req.websiteUrl && (
                      <div className="text-xs text-blue-500 hover:text-blue-600 mt-1">
                        <a href={req.websiteUrl.startsWith('http') ? req.websiteUrl : `https://${req.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          URL
                        </a>
                      </div>
                    )}
                    {req.message && (
                      <details className="mt-1 group cursor-pointer">
                        <summary className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 outline-none select-none list-none inline-flex items-center gap-1 uppercase tracking-wider">
                          <svg className="w-3 h-3 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          Details
                        </summary>
                        <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap shadow-inner max-w-xs">
                          {req.message}
                        </div>
                      </details>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[req.status] || statusStyles.pending}`}>
                      {statusLabels[req.status] || "Pending"}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-semibold text-slate-800">৳{totalAmount.toFixed(2)} total</div>
                    <div className={`text-xs font-medium mt-0.5 ${dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      ৳{dueAmount.toFixed(2)} due
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-500">
                    {req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="italic text-slate-300">Not set</span>}
                  </td>
                  <td className="p-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/admin/requests/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 font-semibold text-xs border border-slate-200 hover:bg-slate-100 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      {recipientEmail && (
                        <AdminSendEmailModal
                          recipientEmail={recipientEmail}
                          recipientName={recipientName}
                          requestId={req.id}
                          serviceType={req.serviceType}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No service requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
