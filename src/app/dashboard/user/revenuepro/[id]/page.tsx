import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LiveSiteDataPanel } from "@/components/LiveSiteDataPanel";
import { 
  ArrowLeftIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  SignalIcon,
  XCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default async function UserLicenseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  const { id } = await params;
  
  if (!user) {
    redirect("/sign-in");
  }

  // Ensure user owns this license either by clerk ID or email
  const license = await prisma.license.findFirst({
    where: { 
      id,
      OR: [
        { userId: user.id },
        { customerEmail: user.emailAddresses[0]?.emailAddress }
      ]
    },
    include: {
      logs: { orderBy: { timestamp: "desc" }, take: 20 },
      fraudStats: { orderBy: { createdAt: "desc" }, take: 10 },
      transactions: { orderBy: { createdAt: "desc" } }
    }
  });


  if (!license) return notFound();

  const isExpired = license.expirationDate && new Date(license.expirationDate) < new Date();

  const isActive = license.status === "active";
  const isPending = license.status === "pending";

  // Extract connected store info from the latest successful ping
  const lastSuccessPing = license.logs.find(l => l.status === "success");
  const totalSuccessPings = license.logs.filter(l => l.status === "success").length;
  const totalFailedPings = license.logs.filter(l => l.status === "failed").length;

  const statusLabel = isExpired ? "Expired" : isActive ? "Active" : isPending ? "Pending" : "Suspended";
  const statusColor = isExpired ? "text-red-700 bg-red-50 border-red-200" : isActive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : isPending ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/user/revenuepro" 
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">License Details</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{license.domain}</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider shadow-sm ${statusColor}`}>
          {statusLabel}
        </div>
      </div>

      {/* 
        ========================================
        1. LIVE STORE DATA (FULL WIDTH AT TOP)
        ========================================
      */}
      {license.status === "active" && (
        <div className="w-full">
          <LiveSiteDataPanel licenseId={license.id} domain={license.domain} />
        </div>
      )}

      {/* 
        ========================================
        2. DETAILS GRID
        ========================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: General Info & Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <InformationCircleIcon className="w-6 h-6 text-indigo-500" />
              General Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <GlobeAltIcon className="w-4 h-4" /> Domain
                </div>
                <div className="text-base font-semibold text-slate-800">{license.domain}</div>
              </div>
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4" /> Plan
                </div>
                <div className="text-base font-semibold text-slate-800">{license.tier}</div>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 mb-6">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                License Key
              </div>
              {isActive ? (
                <code className="text-lg font-mono font-bold text-indigo-700 bg-white px-4 py-2 rounded-xl inline-block border border-indigo-200 shadow-sm break-all w-full sm:w-auto text-center sm:text-left">
                  {license.key}
                </code>
              ) : (
                <div className="text-sm font-medium text-slate-500 italic bg-white px-4 py-2 rounded-xl inline-block border border-slate-200">
                  Awaiting Activation...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-slate-100">
               <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Created On</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {isActive ? new Date(license.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }) : "N/A"}
                  </div>
               </div>
               <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Expires On</div>
                  <div className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isActive ? (license.expirationDate ? new Date(license.expirationDate).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }) : 'Lifetime') : "N/A"}
                  </div>
               </div>
            </div>
          </div>

          {/* Verification Logs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <SignalIcon className="w-6 h-6 text-slate-400" />
              Website Ping Logs (Health)
            </h3>
            
            {license.logs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <SignalIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No connection pings recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {license.logs.map(log => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 gap-2">
                    <div className="flex items-center gap-2.5">
                       {log.status === 'success' ? (
                         <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                       ) : (
                         <XCircleIcon className="w-5 h-5 text-red-500" />
                       )}
                       <div>
                         <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{log.status}</div>
                         <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px] sm:max-w-[250px]">IP: {log.ipAddress || 'Unknown'}</div>
                       </div>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm whitespace-nowrap self-start sm:self-auto">
                       {new Date(log.timestamp).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Connection Sidebar & Billing */}
        <div className="space-y-6">

          {/* Connected Store Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wider flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-indigo-500" />
              Connection Details
            </h3>

            {lastSuccessPing ? (
              <div className="space-y-4">
                {/* Connection Status */}
                {isExpired ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                    <span className="relative flex h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-sm font-bold text-red-800">License Expired</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-emerald-800">Connected & Active</span>
                  </div>
                )}

                {/* Server IP */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Server IP Address</div>
                  <div className="text-sm font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{lastSuccessPing.ipAddress || "Unknown"}</div>
                </div>

                {/* Ping Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-emerald-600">{totalSuccessPings}</div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Success Pings</div>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-red-500">{totalFailedPings}</div>
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Failed Pings</div>
                  </div>
                </div>

                {/* Last Active */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Connected</div>
                  <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">
                    {new Date(lastSuccessPing.timestamp).toLocaleString("en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GlobeAltIcon className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No Store Connected</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Install the RevenuePro plugin on your WordPress site and enter your License Key to connect.</p>
              </div>
            )}
          </div>

          {/* Billing & Payment */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wider flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-indigo-500" />
              Billing & Payments
            </h3>
            
            <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center mb-5
              ${license.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${license.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                Payment Status
              </div>
              <div className={`text-lg font-black capitalize ${license.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {license.paymentStatus === 'paid' ? "Paid" : "Awaiting Payment"}
              </div>
            </div>

            {license.transactions.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center font-medium border border-slate-100 border-dashed">No payment history.</p>
            ) : (
              <div className="space-y-3">
                {license.transactions.map((trx) => (
                  <div key={trx.id} className="p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl border border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">{trx.transactionId || "N/A"}</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border
                        ${trx.status === "verified" || trx.status === "completed" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          trx.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-red-100 text-red-700 border-red-200"}`}
                      >
                        {trx.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{new Date(trx.createdAt).toLocaleDateString()}</span>
                      <span className="uppercase tracking-wide text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{trx.paymentMethod.replace("_", " ")}</span>
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
