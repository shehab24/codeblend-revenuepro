import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MaskedLicenseKey } from "@/components/MaskedLicenseKey";
import { LiveSiteDataPanel } from "@/components/LiveSiteDataPanel";
import { AdminExtendLicenseButton } from "@/components/AdminExtendLicenseButton";
import { 
  SignalIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

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
      fraudStats: { orderBy: { createdAt: "desc" }, take: 10 },
      transactions: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!license) return notFound();

  const isExpired = license.expirationDate && new Date(license.expirationDate) < new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin/licenses" 
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">License Details</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{license.domain}</p>
          </div>
        </div>
        <AdminExtendLicenseButton 
          licenseId={license.id} 
          currentTier={license.tier} 
        />
      </div>

      {/* Expired Warning */}
      {isExpired && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <span className="text-xl mt-0.5">⏰</span>
          <div>
            <div className="text-sm font-bold text-red-800">This license has expired!</div>
            <p className="text-xs text-red-700 mt-1">The plugin’s premium features are now disabled on the customer’s site. Use the “Extend / Renew Expiry” button in the sidebar to reactivate.</p>
          </div>
        </div>
      )}

      {/* Live Site Data - Full Width at Top */}
      {license.status === "active" && (
        <div className="w-full">
          <LiveSiteDataPanel licenseId={license.id} domain={license.domain} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
                <MaskedLicenseKey licenseKey={license.key} />
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
                  <div className="text-sm font-semibold text-slate-800">{new Date(license.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })}</div>
               </div>
               <div>
                  <div className="text-xs text-slate-500 font-medium">Expires On</div>
                  <div className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }) : 'Lifetime (Never)'}
                  </div>
               </div>
            </div>
          </div>

          {/* Verification Logs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <SignalIcon className="w-6 h-6 text-slate-400" />
              Recent Verification Pings
            </h3>
            {license.logs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <SignalIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No verification logs available yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {license.logs.map(log => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                       {log.status === 'success' ? (
                         <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                       ) : (
                         <XCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
                       )}
                       <div className="min-w-0">
                         <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{log.status}</div>
                         <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-full sm:max-w-[400px]">
                           {log.ipAddress || "Unknown IP"} • <span title={log.userAgent || ""}>{log.userAgent || "Unknown Client"}</span>
                         </div>
                       </div>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm whitespace-nowrap self-start sm:self-auto shrink-0">
                       {new Date(log.timestamp).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
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

          {/* Extend License */}
          <AdminExtendLicenseButton licenseId={license.id} currentTier={license.tier} />

          {/* Payment History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Payment History</h3>
            {license.transactions.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No payment history found.</p>
            ) : (
              <div className="space-y-3">
                {license.transactions.map((trx) => (
                  <div key={trx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-600">{trx.transactionId || "N/A"}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider
                        ${trx.status === "verified" || trx.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          trx.status === "pending" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"}`}
                      >
                        {trx.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(trx.createdAt).toLocaleString()}</span>
                      <span className="uppercase font-semibold text-slate-400">{trx.paymentMethod.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
