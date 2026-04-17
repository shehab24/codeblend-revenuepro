import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Courier Fraud Statistics</h2>
        <span style={{ 
          padding: "0.3rem 0.8rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: "bold",
          background: "rgba(16, 185, 129, 0.1)", color: "var(--primary)" 
        }}>
          {fraudStats.length} Records
        </span>
      </div>

      {fraudStats.length === 0 ? (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>
            No fraud statistics synced yet. Connect your WordPress plugin to start receiving data.
          </div>
        </div>
      ) : (
        <ClientFraudStatsTable initialStats={fraudStats} />
      )}
    </div>
  );
}
