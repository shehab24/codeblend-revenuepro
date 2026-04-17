import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCreateLicenseForm } from "@/components/AdminCreateLicenseForm";
import { AdminDeleteLicenseButton } from "@/components/AdminDeleteLicenseButton";
import { AdminPingLicenseButton } from "@/components/AdminPingLicenseButton";

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

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Create Form */}
        <div>
          <AdminCreateLicenseForm />
        </div>

        {/* Right Column: Licenses List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>System-Wide Licenses</h2>
          
          {licenses.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>
                No licenses generated in the system.
              </div>
            </div>
          ) : (
            licenses.map((license) => (
              <div key={license.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="flex-between" style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Target Domain</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                      {license.domain}
                      <span style={{fontSize: "0.70rem", color: "var(--primary)", padding: "2px 6px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "4px", fontWeight: "500"}}>
                        {license.tier}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.80rem", marginTop: "0.25rem" }}>
                      Bound Email: <span style={{ color: "var(--foreground)" }}>{license.customerEmail || "None"}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>System Status</div>
                      {license.logs && license.logs.length > 0 && license.logs[0].status === "success" && new Date().getTime() - new Date(license.logs[0].timestamp).getTime() < (24 * 60 * 60 * 1000) ? (
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold", background: "rgba(16, 185, 129, 0.1)", color: "var(--primary)" }}>RUNNING</span>
                      ) : (
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold", background: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)" }}>IDLE</span>
                      )}
                    </div>
                    <div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Expiration</div>
                      <span style={{ 
                        padding: "0.2rem 0.6rem", 
                        borderRadius: "9999px", 
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        background: license.expirationDate && new Date(license.expirationDate) < new Date() ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: license.expirationDate && new Date(license.expirationDate) < new Date() ? "var(--error)" : "var(--primary)"
                      }}>
                        {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString() : "Lifetime"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <code style={{ fontSize: "0.9rem", color: "var(--primary)", wordBreak: "break-all" }}>{license.key}</code>
                  <div style={{ marginLeft: "1rem", display: "flex", alignItems: "center" }}>
                    <AdminPingLicenseButton licenseId={license.id} />
                    <AdminDeleteLicenseButton licenseId={license.id} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
