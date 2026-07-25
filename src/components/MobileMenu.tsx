"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const navLinks = [
  { href: "/services", label: "Services", icon: "⚡" },
  { href: "/features", label: "Features", icon: "⚙️" },
  { href: "/pricing", label: "Pricing", icon: "💰" },
  { href: "/fraud-check", label: "Fraud Check", icon: "🛡️" },
];

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client mount so createPortal works
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset submenu state on close
  useEffect(() => {
    if (!open) {
      setProductsOpen(false);
    }
  }, [open]);

  const drawer = (
    <>
      {/* Backdrop — rendered directly in body via portal, so z-index is always correct */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        aria-hidden="true"
      />

      {/* Slide Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "288px",
          maxWidth: "85vw",
          backgroundColor: "white",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
          zIndex: 9999,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #10b981, #0d9488)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16, boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
              C
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>CodeBlend</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: -2 }}>Digital Solutions</div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 18 }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: "12px", flex: 1, overflowY: "auto" }}>
          {/* Products Collapsible Item */}
          <div style={{ marginBottom: 4 }}>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                color: productsOpen ? "#10b981" : "#334155",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20, width: 24, textAlign: "center" }}>📦</span>
                Products
              </span>
              <svg
                style={{
                  width: 14,
                  height: 14,
                  transition: "transform 0.2s",
                  transform: productsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: productsOpen ? "#10b981" : "#94a3b8",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div
              style={{
                maxHeight: productsOpen ? "200px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s",
                opacity: productsOpen ? 1 : 0,
                paddingLeft: "16px",
                marginTop: 2,
              }}
            >
              <Link
                href="/revenuepro"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 10,
                  color: "#475569",
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: "none",
                  marginBottom: 2,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 18, width: 20, textAlign: "center" }}>🛡️</span>
                Revenue Pro
              </Link>
              <Link
                href="/codepay"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 10,
                  color: "#475569",
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: "none",
                  marginBottom: 2,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 18, width: 20, textAlign: "center" }}>💳</span>
                Code Pay
              </Link>
              <Link
                href="/expense-tracker"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 10,
                  color: "#475569",
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: "none",
                  marginBottom: 2,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 18, width: 20, textAlign: "center" }}>📊</span>
                Expense Tracker
              </Link>
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, color: "#334155", fontWeight: 500, fontSize: 15, textDecoration: "none", marginBottom: 4, transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 20, width: 24, textAlign: "center" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA at bottom */}
        <div style={{ padding: 20, borderTop: "1px solid #f1f5f9" }}>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              style={{ display: "block", width: "100%", padding: "14px", background: "linear-gradient(135deg, #10b981, #0d9488)", color: "white", borderRadius: 16, fontWeight: 700, fontSize: 14, textAlign: "center", textDecoration: "none", boxShadow: "0 4px 12px rgba(16,185,129,0.4)" }}
            >
              🚀 Dashboard →
            </Link>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              style={{ display: "block", width: "100%", padding: "14px", background: "linear-gradient(135deg, #10b981, #0d9488)", color: "white", borderRadius: 16, fontWeight: 700, fontSize: 14, textAlign: "center", textDecoration: "none", boxShadow: "0 4px 12px rgba(16,185,129,0.4)" }}
            >
              Get Started →
            </Link>
          )}
          <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 10 }}>✓ 5-min setup · ✓ Free plan available</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors gap-1.5"
        aria-label="Open menu"
      >
        <span className="w-5 h-0.5 bg-slate-700 rounded-full" />
        <span className="w-5 h-0.5 bg-slate-700 rounded-full" />
        <span className="w-3.5 h-0.5 bg-slate-700 rounded-full" />
      </button>

      {/* Render drawer+backdrop directly into body to bypass all stacking contexts */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
