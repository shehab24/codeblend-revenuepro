import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCreateLicenseForm } from "@/components/AdminCreateLicenseForm";
import { AdminLicenseList } from "@/components/AdminLicenseList";

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

  // Serialize for client component
  const serializedLicenses = licenses.map(l => ({
    id: l.id,
    domain: l.domain,
    key: l.key,
    tier: l.tier,
    status: l.status,
    paymentStatus: l.paymentStatus,
    customerEmail: l.customerEmail || l.user?.email || "Unknown",
    userName: l.user?.name || null,
    expirationDate: l.expirationDate ? l.expirationDate.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    lastPing: l.logs?.[0] ? {
      status: l.logs[0].status,
      timestamp: l.logs[0].timestamp.toISOString()
    } : null,
  }));

  const pendingCount = licenses.filter(l => l.status === "pending").length;
  const activeCount = licenses.filter(l => l.status === "active").length;
  const totalCount = licenses.length;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Total Licenses</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
          <div className="text-xs text-emerald-500 font-semibold mt-1">Active</div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-xs text-amber-500 font-semibold mt-1">Pending</div>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-500">{totalCount - activeCount - pendingCount}</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Suspended/Revoked</div>
        </div>
      </div>

      {/* Create Form (collapsible at top) */}
      <AdminCreateLicenseForm />

      {/* License List with Search */}
      <AdminLicenseList licenses={serializedLicenses} />
    </div>
  );
}
