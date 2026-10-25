import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCreateLicenseForm } from "@/components/AdminCreateLicenseForm";
import { AdminLicenseList } from "@/components/AdminLicenseList";
import { CheckBadgeIcon, ClockIcon, KeyIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { PageHeader, StatCard } from "@/components/dashboard/ui";

export default async function AdminLicensesPage() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      user: true,
      logs: { take: 1, orderBy: { timestamp: "desc" } },
      transactions: {
        where: { status: "pending" },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
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
    pendingTransaction: l.transactions?.[0] ? {
      id: l.transactions[0].id,
      transactionId: l.transactions[0].transactionId,
      senderNumber: l.transactions[0].senderNumber,
    } : null,
  }));

  const pendingCount = licenses.filter(l => l.status === "pending").length;
  const activeCount = licenses.filter(l => l.status === "active").length;
  const totalCount = licenses.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Licenses"
        description="Generate keys, bind them to domains and control renewals, payments and suspensions."
        icon={<KeyIcon className="h-6 w-6" />}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total licenses" value={totalCount} icon={<KeyIcon className="h-5 w-5" />} tone="slate" />
        <StatCard label="Active" value={activeCount} icon={<CheckBadgeIcon className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Pending" value={pendingCount} icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
        <StatCard label="Suspended / revoked" value={totalCount - activeCount - pendingCount} icon={<NoSymbolIcon className="h-5 w-5" />} tone="rose" />
      </div>

      {/* Create Form (collapsible at top) */}
      <AdminCreateLicenseForm />

      {/* License List with Search */}
      <AdminLicenseList licenses={serializedLicenses} />
    </div>
  );
}
