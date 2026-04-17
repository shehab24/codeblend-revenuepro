import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { licenses: true }
      }
    }
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ color: "var(--foreground)" }}>Registered System Users</h3>
        <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
          This table automatically syncs with your Clerk users every time they visit the dashboard.
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Name</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Email</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Role</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Generated Licenses</th>
              <th style={{ padding: "1rem 0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: "500" }}>Joined Account</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length > 0 ? allUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--card-border)", color: "var(--foreground)" }}>
                <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>{u.name || "N/A"}</td>
                <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>{u.email}</td>
                <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>
                  <span style={{ 
                    padding: "0.2rem 0.5rem", 
                    borderRadius: "4px", 
                    fontSize: "0.75rem",
                    background: u.role === "admin" ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                    color: u.role === "admin" ? "var(--primary)" : "var(--text-muted)"
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>{u._count.licenses} licenses</td>
                <td style={{ padding: "1rem 0.5rem", fontSize: "0.875rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No users synced yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
