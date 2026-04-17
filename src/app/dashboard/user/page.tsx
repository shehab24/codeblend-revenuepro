import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CreateLicenseForm } from "@/components/CreateLicenseForm";

export default async function UserDashboard() {
  const { userId } = await auth();
  
  if (!userId) return null;

  const licenses = await prisma.license.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { logs: { take: 5, orderBy: { timestamp: "desc" } } }
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Create Form */}
        <div>
          <CreateLicenseForm />
        </div>

        {/* Right Column: Licenses List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Your API Licenses</h2>
          
          {licenses.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>
                You haven't generated any licenses yet.
              </div>
            </div>
          ) : (
            licenses.map((license) => (
              <div key={license.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="flex-between" style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Target Domain</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{license.domain}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Status</div>
                    <span style={{ 
                      padding: "0.2rem 0.6rem", 
                      borderRadius: "9999px", 
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      background: license.status === "active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: license.status === "active" ? "var(--primary)" : "var(--error)"
                    }}>
                      {license.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.9rem", color: "var(--primary)", wordBreak: "break-all" }}>{license.key}</code>
                </div>

                {license.logs.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Recent Authentications:</div>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {license.logs.map(log => (
                        <li key={log.id} style={{ fontSize: "0.8rem", color: "var(--foreground)", display: "flex", justifyContent: "space-between" }}>
                          <span>{new Date(log.timestamp).toLocaleString()} • {log.ipAddress}</span>
                          <span style={{ color: log.status === "success" ? "var(--primary)" : "var(--error)" }}>{log.status.toUpperCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
