import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const requests = await prisma.serviceRequest.findMany({
    where: { applicantId: userId },
    orderBy: { createdAt: "desc" },
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Requests</h2>
          <p className="text-sm text-slate-400 mt-1">Track the status and billing of your service requests.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-slate-500 font-medium text-lg">No requests found</div>
          <div className="text-slate-400 text-sm mt-1">You haven&apos;t submitted any service requests yet.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const totalAmount = req.totalAmount || 0;
            const paidAmount = req.paidAmount || 0;
            const dueAmount = totalAmount - paidAmount;
            
            return (
              <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-200 transition-all">
                {/* Info Section */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border ${statusStyles[req.status] || statusStyles.pending}`}>
                      {statusLabels[req.status] || "Pending"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(req.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{req.serviceType}</h3>
                  <Link 
                    href={`/dashboard/user/requests/${req.id}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
                  >
                    View Full Details
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  {req.deliveryDate && (
                    <div className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Expected Delivery: <span className="font-semibold text-slate-700">{new Date(req.deliveryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  )}
                </div>

                {/* Billing Section */}
                <div className="flex flex-col md:items-end shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-100 min-w-[200px]">
                  <div className="w-full flex justify-between md:justify-end md:gap-8 text-sm mb-1.5">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-semibold text-slate-800">৳{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full flex justify-between md:justify-end md:gap-8 text-sm mb-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Paid:</span>
                    <span className="font-semibold text-emerald-600">৳{paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full flex justify-between md:justify-end md:gap-8 text-sm font-semibold">
                    <span className="text-slate-700">Due:</span>
                    <span className={dueAmount > 0 ? "text-red-500" : "text-emerald-500"}>
                      ৳{dueAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/dashboard/user/requests/${req.id}/invoice`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all no-underline"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Invoice
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
