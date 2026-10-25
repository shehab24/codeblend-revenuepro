import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { ClientFraudStatsTable } from "./ClientFraudStatsTable";

export default async function AdminFraudStatsPage() {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const fraudStats = await prisma.fraudStat.findMany({
    orderBy: { last_checked: "desc" },
    include: { license: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tools"
        title="Courier fraud statistics"
        description="Cached delivery history for customer phone numbers across all couriers."
        icon={<ShieldCheckIcon className="h-6 w-6" />}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            {fraudStats.length.toLocaleString()} records
          </span>
        }
      />

      {fraudStats.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<ShieldCheckIcon className="h-6 w-6" />}
            title="No fraud statistics synced yet"
            description="Connect your WordPress plugin to start receiving data."
          />
        </Panel>
      ) : (
        <ClientFraudStatsTable initialStats={fraudStats} />
      )}
    </div>
  );
}
