import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminRequestUpdateModal } from "./AdminRequestUpdateModal";
import { RequestSearch } from "./RequestSearch";

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
    ]
  } : {};

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { applicant: true },
    where: whereClause,
  });

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
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="mb-4 pb-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Manage Service Requests</h3>
          <p className="text-sm text-slate-400 mt-1">Review user requests, set pricing, status, and delivery expectations.</p>
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
              <th className="p-3 text-xs font-medium text-slate-400 uppercase tracking-wide text-center">Manage</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? requests.map((req) => {
              const totalAmount = req.totalAmount || 0;
              const paidAmount = req.paidAmount || 0;
              const dueAmount = totalAmount - paidAmount;
              return (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-3 text-sm">
                    <div className="font-semibold text-slate-800">{req.applicant.name || "N/A"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{req.applicant.email}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium text-slate-800">{req.serviceType}</div>
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
                    <AdminRequestUpdateModal request={JSON.stringify(req)} />
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
  );
}
