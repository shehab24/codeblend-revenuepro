import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminLicenseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  const { id } = await params;
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const license = await prisma.license.findUnique({
    where: { id },
    include: {
      user: true,
      logs: { orderBy: { timestamp: "desc" }, take: 20 },
      fraudStats: { orderBy: { createdAt: "desc" }, take: 10 }
    }
  });

  if (!license) return notFound();

  const isExpired = license.expirationDate && new Date(license.expirationDate) < new Date();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <Link 
          href="/dashboard/admin/licenses" 
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">License Details</h1>
          <p className="text-sm text-slate-500">{license.domain}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Info Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Core Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Domain</div>
                <div className="text-sm font-semibold text-slate-800">{license.domain}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Email</div>
                <div className="text-sm font-semibold text-slate-800 truncate">{license.customerEmail || license.user?.email || "N/A"}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">License Key</div>
                <code className="text-sm font-mono text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded inline-block break-all">{license.key}</code>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">License Status</div>
                 <div className="text-sm font-bold text-slate-700 capitalize">{license.status}</div>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Status</div>
                 <div className={`text-sm font-bold ${license.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'} capitalize`}>
                   {license.paymentStatus}
                 </div>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Plan Tier</div>
                 <div className="text-sm font-bold text-slate-700">{license.tier}</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
               <div>
                  <div className="text-xs text-slate-500 font-medium">Created On</div>
                  <div className="text-sm font-semibold text-slate-800">{new Date(license.createdAt).toLocaleString()}</div>
               </div>
               <div>
                  <div className="text-xs text-slate-500 font-medium">Expires On</div>
                  <div className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {license.expirationDate ? new Date(license.expirationDate).toLocaleString() : 'Lifetime (Never)'}
                  </div>
               </div>
            </div>
          </div>

          {/* Verification Logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Recent Verification Pings</h3>
            {license.logs.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No verification logs available yet.</p>
            ) : (
              <div className="space-y-3">
                {license.logs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                       <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         <span className="text-sm font-bold text-slate-700 uppercase">{log.status}</span>
                       </div>
                       <div className="text-xs text-slate-500 mt-1">{log.ipAddress || "Unknown IP"} • {log.userAgent || "Unknown Client"}</div>
                    </div>
                    <div className="text-xs font-medium text-slate-400 text-right">
                       {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Binding Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Account Binding</h3>
            {license.user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {license.user.name?.charAt(0) || license.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{license.user.name || "Unnamed User"}</div>
                    <div className="text-xs text-slate-500">{license.user.email}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">Clerk ID:</div>
                  <code className="text-xs font-mono text-slate-700 bg-slate-200 px-2 py-1 rounded mt-1 inline-block">{license.user.id}</code>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No user bound to this license.</p>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-emerald-900 mb-4 uppercase tracking-wider">Fraud Checks Summary</h3>
            <div className="text-3xl font-black text-emerald-600">{license.fraudStats.length}</div>
            <div className="text-xs font-bold text-emerald-700 mt-1 uppercase tracking-widest">Total Numbers Checked</div>
            <p className="text-xs text-emerald-600 mt-3 leading-relaxed">
              This license has queried {license.fraudStats.length} unique phone numbers through the CodeBlend API.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
