import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function UserDashboard() {
  const { userId } = await auth();
  
  if (!userId) return null;

  const totalRequests = await prisma.serviceRequest.count({
    where: { applicantId: userId }
  });

  return (
    <div>
      <p className="text-slate-500 mb-8 border-b border-slate-100 pb-4">
        Welcome to your CodeBlend Client Portal. Select an action below to get started.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Request Service Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Need a Service?</h3>
          <p className="text-sm text-slate-500 mb-6">Request custom development, support, or design from our team.</p>
          <Link href="/dashboard/user/services" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl transition w-full mt-auto">
            Get Service
          </Link>
        </div>

        {/* My Requests Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">My Requests</h3>
          <p className="text-sm text-slate-500 mb-6">You have <strong>{totalRequests}</strong> active or past service requests tracked.</p>
          <Link href="/dashboard/user/requests" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl transition w-full mt-auto">
            View Requests
          </Link>
        </div>

        {/* Revenue Pro Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Downloads</h3>
          <p className="text-sm text-slate-500 mb-6">Access and download your purchased Revenue Pro plugins.</p>
          <Link href="/dashboard/user/revenuepro" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-6 py-2.5 rounded-xl transition w-full mt-auto">
            View Downloads
          </Link>
        </div>

      </div>
    </div>
  );
}
