import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "@/components/SidebarNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  const isAdmin = user.publicMetadata?.role === "admin";
  const userEmail = user.emailAddresses[0]?.emailAddress || "unknown@domain.com";

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: userEmail,
        name: user.fullName || "User",
        role: isAdmin ? "ADMIN" : "USER",
      },
      update: {
        email: userEmail,
        name: user.fullName || "User",
        role: isAdmin ? "ADMIN" : "USER",
      }
    });
  } catch (error: any) {
    // If unique constraint fails on email, it means another Clerk instance (e.g. live vs dev keys) 
    // already inserted this email. We gracefully handle it by updating that existing user's ID to the new one.
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      await prisma.user.update({
        where: { email: userEmail },
        data: {
          id: user.id,
          name: user.fullName || "User",
          role: isAdmin ? "ADMIN" : "USER",
        }
      });
    } else {
      throw error;
    }
  }

  return (
    <div className="dashboard-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
      <aside style={{ width: "250px", borderRight: "1px solid var(--card-border)", background: "var(--card-bg)" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--card-border)" }}>
          <Link href="/">
            <h2 style={{ color: "var(--foreground)", margin: 0, fontSize: "1.25rem" }}>
              <span style={{ color: "var(--primary)" }}>✦</span> RevenuePro
            </h2>
          </Link>
        </div>
        <nav style={{ padding: "1rem" }}>
          <SidebarNav isAdmin={!!isAdmin} />
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid var(--card-border)" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                {isAdmin ? "Admin View" : "User View"}
              </div>
            </div>
            <UserButton />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
