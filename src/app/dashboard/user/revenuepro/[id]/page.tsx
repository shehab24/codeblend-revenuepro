import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

  const statusLabel = isActive ? "অ্যাক্টিভ (Active)" : isPending ? "অপেক্ষমাণ (Pending)" : "স্থগিত (Suspended)";
  const statusColor = isActive ? "text-emerald-700 bg-emerald-50" : isPending ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <Link 
          href="/dashboard/user/revenuepro" 
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">লাইসেন্স বিস্তারিত (Details)</h1>
          <p className="text-sm text-slate-500">{license.domain}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Info Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              সাধারণ তথ্য (General Info)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ডোমেইন (Domain)</div>
                <div className="text-sm font-semibold text-slate-800">{license.domain}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">প্ল্যান (Plan)</div>
                <div className="text-sm font-semibold text-slate-800">{license.tier}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 sm:col-span-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">লাইসেন্স কি (License Key)</div>
                {isActive ? (
                  <code className="text-sm font-mono text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded inline-block break-all">{license.key}</code>
                ) : (
                  <div className="text-sm font-mono text-slate-400 italic">অপেক্ষমাণ (Pending)</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className={`flex-1 p-4 rounded-xl border border-slate-100 ${statusColor}`}>
                 <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">স্ট্যাটাস (Status)</div>
                 <div className="text-sm font-bold">{statusLabel}</div>
              </div>
              <div className={`flex-1 p-4 rounded-xl border border-slate-100 ${license.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                 <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">পেমেন্ট (Payment)</div>
                 <div className="text-sm font-bold capitalize">
                   {license.paymentStatus === 'paid' ? "সম্পন্ন (Paid)" : "অপেক্ষায় (Awaiting)"}
                 </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
               <div>
                  <div className="text-xs text-slate-500 font-medium">শুরুর তারিখ (Created On)</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {isActive ? new Date(license.createdAt).toLocaleString("bn-BD", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
                  </div>
               </div>
               <div>
                  <div className="text-xs text-slate-500 font-medium">মেয়াদ শেষ (Expires On)</div>
                  <div className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isActive ? (license.expirationDate ? new Date(license.expirationDate).toLocaleString("bn-BD", { day: "numeric", month: "long", year: "numeric" }) : 'আজীবন (Lifetime)') : "N/A"}
                  </div>
               </div>
            </div>
          </div>

          {/* Verification Logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">ওয়েবসাইট পিং লগ (Recent Pings)</h3>
            {license.logs.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">এখনো কোনো ওয়েবসাইট থেকে পিং আসেনি।</p>
            ) : (
              <div className="space-y-3">
                {license.logs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                       <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         <span className="text-sm font-bold text-slate-700 uppercase">{log.status}</span>
                       </div>
                    </div>
                    <div className="text-xs font-medium text-slate-400 text-right">
                       {new Date(log.timestamp).toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-emerald-900 mb-4 uppercase tracking-wider">ফ্রড চেক পরিসংখ্যান</h3>
            <div className="text-3xl font-black text-emerald-600">{license.fraudStats.length}</div>
            <div className="text-xs font-bold text-emerald-700 mt-1 uppercase tracking-widest">মোট নম্বর চেক করা হয়েছে</div>
            <p className="text-xs text-emerald-600 mt-3 leading-relaxed">
              আপনার ওয়েবসাইট থেকে {license.fraudStats.length} টি আলাদা ফোন নাম্বারের ডেলিভারি রেশিও চেক করা হয়েছে।
            </p>
          </div>

          {/* Payment History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">পেমেন্ট হিস্ট্রি</h3>
            {license.transactions.length === 0 ? (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">কোনো পেমেন্ট হিস্ট্রি নেই।</p>
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
                      <span>{new Date(trx.createdAt).toLocaleDateString("bn-BD")}</span>
                      <span className="uppercase font-semibold">{trx.paymentMethod.replace("_", " ")}</span>
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
