import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCreateLicenseForm } from "@/components/AdminCreateLicenseForm";
import { AdminDeleteLicenseButton } from "@/components/AdminDeleteLicenseButton";
import { AdminPingLicenseButton } from "@/components/AdminPingLicenseButton";
import { AdminToggleLicenseStatusButton } from "@/components/AdminToggleLicenseStatusButton";

export default async function AdminLicensesPage() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      user: true,
      logs: { take: 1, orderBy: { timestamp: "desc" } }
    }
  });

  const pendingLicenses = licenses.filter(l => l.status === "pending");
  const activeLicenses = licenses.filter(l => l.status !== "pending");

  const LicenseRow = ({ license }: { license: any }) => {
    const isRunning = license.logs?.length > 0 && license.logs[0].status === "success" && (Date.now() - new Date(license.logs[0].timestamp).getTime()) < 86400000;
    const isExpired = license.expirationDate && new Date(license.expirationDate) < new Date();
    
    return (
      <div className={`bg-white rounded-xl border ${license.status === 'pending' ? 'border-amber-200 shadow-sm' : 'border-slate-200'} p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all`}>
        {/* Left Side: Domain & User */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-slate-800">{license.domain}</span>
            <span className="text-[0.6rem] uppercase tracking-wider font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{license.tier}</span>
            {license.status === 'pending' && <span className="text-[0.6rem] uppercase tracking-wider font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>PENDING</span>}
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Email: <span className="font-medium text-slate-700">{license.customerEmail || license.user?.email || "Unknown"}</span>
            <span className="mx-2 text-slate-300">|</span>
            Created: {new Date(license.createdAt).toLocaleDateString()}
          </div>
          <code className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{license.key}</code>
        </div>
        
        {/* Center: Server Status (for active only) */}
        {license.status !== 'pending' && (
          <div className="hidden lg:flex flex-col gap-1 px-4 border-l border-r border-slate-100">
            <div className="text-center">
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ping Status</div>
              <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${isRunning ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {isRunning ? "● ONLINE" : "○ OFFLINE"}
              </span>
            </div>
          </div>
        )}

        {/* Right Side: Actions */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <AdminToggleLicenseStatusButton licenseId={license.id} currentStatus={license.status} />
          {license.status !== 'pending' && <AdminPingLicenseButton licenseId={license.id} />}
          <AdminDeleteLicenseButton licenseId={license.id} />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      {/* Left: Create Form */}
      <div className="xl:sticky xl:top-8 order-2 xl:order-1">
        <AdminCreateLicenseForm />
      </div>

      {/* Right: Licenses List */}
      <div className="xl:col-span-2 flex flex-col gap-8 order-1 xl:order-2">
        
        {/* Pending Requests */}
        {pendingLicenses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Action Required: Pending Requests
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Please review and approve these target domains.</p>
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">{pendingLicenses.length} Pending</span>
            </div>
            <div className="flex flex-col gap-3">
              {pendingLicenses.map(license => (
                <LicenseRow key={license.id} license={license} />
              ))}
            </div>
          </div>
        )}

        {/* Active Licenses */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 inline-flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            System-Wide Active & Issued Licenses
          </h2>
          
          {activeLicenses.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <div className="text-slate-400">No active licenses found in the system.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeLicenses.map(license => (
                <LicenseRow key={license.id} license={license} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
