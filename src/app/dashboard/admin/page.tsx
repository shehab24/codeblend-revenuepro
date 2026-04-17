import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const licensesCount = await prisma.license.count();
  const recentLogs = await prisma.verificationLog.findMany({
    take: 5,
    orderBy: { timestamp: "desc" },
    include: { license: true }
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="card-header" style={{ paddingBottom: "0.5rem", borderBottom: "none" }}>
            <div className="text-muted" style={{ fontSize: "0.875rem", textTransform: "uppercase" }}>Total Users</div>
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Managed securely by Clerk
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header" style={{ paddingBottom: "0.5rem", borderBottom: "none" }}>
            <div className="text-muted" style={{ fontSize: "0.875rem", textTransform: "uppercase" }}>Total Licenses</div>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>{licensesCount}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent API Verifications</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Time</th>
                <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Domain</th>
                <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>IP</th>
                <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? recentLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>{log.license.domain}</td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>{log.ipAddress || "N/A"}</td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>
                    <span style={{ 
                      padding: "0.2rem 0.5rem", 
                      borderRadius: "4px", 
                      fontSize: "0.75rem",
                      background: log.status === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: log.status === "success" ? "var(--primary)" : "var(--error)"
                    }}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No verifications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
