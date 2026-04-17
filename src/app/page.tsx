import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "1.5rem 0", borderBottom: "1px solid var(--card-border)", background: "rgba(15, 17, 21, 0.8)", backdropFilter: "blur(10px)" }}>
        <div className="container flex-between">
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "var(--primary)" }}>✦</span> RevenuePro
          </div>
          <div>
            {!userId ? (
              <SignInButton mode="modal">
                <button className="btn btn-primary">Sign In</button>
              </SignInButton>
            ) : (
              <Link href="/dashboard/user" className="btn btn-primary">Dashboard</Link>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ 
          display: "inline-flex",
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "var(--primary)",
          fontSize: "0.875rem",
          marginBottom: "1.5rem"
        }}>
          Authentication powered by Clerk
        </div>
        
        <h1 style={{ fontSize: "3.5rem", fontWeight: "800", letterSpacing: "-0.05em", color: "#fff", marginBottom: "1.5rem", lineHeight: "1.1" }}>
          Secure & Monetize Your <br />
          <span style={{ color: "var(--primary)" }}>Digital Products</span>
        </h1>
        
        <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
          RevenuePro provides an enterprise-grade license management system with instantaneous verification APIs and comprehensive fraud-checking endpoints.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          {!userId ? (
            <SignInButton mode="modal">
              <button className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}>
                Get Started Free
              </button>
            </SignInButton>
          ) : (
            <Link href="/dashboard/user" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}>
              Launch App
            </Link>
          )}
        </div>

        <div style={{ marginTop: "5rem", width: "100%", maxWidth: "1000px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div className="card text-center">
              <h3 className="card-title">Dynamic Licenses</h3>
              <p className="text-muted mt-4">Generate and validate unique API keys and licenses instantly. Bind licenses to specific domains securely.</p>
            </div>
            <div className="card text-center">
              <h3 className="card-title">Fraud Prevention</h3>
              <p className="text-muted mt-4">Real-time domain authentication and device fingerprinting to prevent unauthorized usage and account sharing.</p>
            </div>
            <div className="card text-center">
              <h3 className="card-title">Detailed Analytics</h3>
              <p className="text-muted mt-4">Track every license validation attempt. Monitor your product's usage metrics effectively from a premium dashboard.</p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ padding: "2rem 0", borderTop: "1px solid var(--card-border)", textAlign: "center", color: "var(--text-muted)" }}>
        <p>© 2026 RevenuePro Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
