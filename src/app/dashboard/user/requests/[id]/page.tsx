import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Request Details | CodeBlend" };
}

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  if (!userId) redirect("/");

  const request = await prisma.serviceRequest.findUnique({
    where: { id },
  });

  const client = await (await import("@clerk/nextjs/server")).clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const dbUser = await prisma.user.findUnique({ where: { email } });
  
  if (!request || request.applicantId !== dbUser?.id) {
    notFound();
  }

  const totalAmount = request.totalAmount || 0;
  const paidAmount = request.paidAmount || 0;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const statusStyles: Record<string, { label: string, color: string, badge: string }> = {
    pending: { label: "Pending", color: "text-amber-600", badge: "bg-amber-100 text-amber-700 border-amber-200" },
    in_progress: { label: "In Progress", color: "text-blue-600", badge: "bg-blue-100 text-blue-700 border-blue-200" },
    completed: { label: "Completed", color: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Cancelled", color: "text-red-600", badge: "bg-red-100 text-red-700 border-red-200" },
  };

  const statusInfo = statusStyles[request.status] || statusStyles.pending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/user/requests" className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                Requested on {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(request.createdAt))}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{request.serviceType}</h1>
            
            {request.deliveryDate && (
              <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-700 font-medium">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Expected Delivery: <span className="text-slate-900">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(request.deliveryDate))}</span>
              </div>
            )}
          </div>
          
          <div className="shrink-0 flex items-center justify-end">
            <Link 
              href={`/dashboard/user/requests/${request.id}/invoice`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Invoice
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Project Requirements</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
              {request.message || "No requirements provided."}
            </div>
          </div>
          
          <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Billing Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-bold text-slate-800 text-base">৳{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Paid Amount</span>
                <span className="font-bold text-emerald-600">৳{paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-700 font-bold">Total Due</span>
                <span className={`font-bold text-lg ${dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  ৳{dueAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
