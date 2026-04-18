"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { submitLead } from "@/actions/leadActions";

export function LeadCTAButton({
  children,
  className,
  serviceType = "General Inquiry",
}: {
  children: React.ReactNode;
  className?: string;
  serviceType?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error || "An error occurred.");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setErrorMessage("");
    }, 300);
  };

  const modal = isOpen ? (
    <>
      {/* Full-screen Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)", zIndex: 99998,
        }}
      />

      {/* Centered Modal */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px", pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto", backgroundColor: "white",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            width: "100%", maxWidth: "480px", maxHeight: "90vh",
            overflowY: "auto", position: "relative",
          }}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute", top: "16px", right: "16px",
              width: "32px", height: "32px", display: "flex",
              alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "none", background: "transparent",
              color: "#94a3b8", fontSize: "18px", cursor: "pointer",
            }}
          >
            ✕
          </button>

          <div style={{ padding: "32px" }}>
            {/* ── SUCCESS ── */}
            {status === "success" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: "64px", height: "64px", backgroundColor: "#d1fae5",
                  color: "#10b981", borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: "28px",
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
                  আপনার আবেদনটি সফল হয়েছে
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.7, marginBottom: "6px" }}>
                  আপনার ইমেইলে একটি ইমেইল পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন এবং আবেদন-এর স্ট্যাটাস জানতে লগইন করুন।
                </p>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "28px" }}>
                  সার্ভিস: <strong style={{ color: "#334155" }}>{serviceType}</strong>
                </p>
                <a
                  href="/sign-in"
                  style={{
                    display: "block", width: "100%",
                    backgroundColor: "#10b981", color: "white",
                    padding: "14px 32px", borderRadius: "12px",
                    fontWeight: 700, fontSize: "15px", textAlign: "center",
                    textDecoration: "none", marginBottom: "12px",
                    boxSizing: "border-box",
                  }}
                >
                  🚀 লগইন করুন
                </a>
                <button
                  onClick={handleClose}
                  style={{
                    width: "100%", backgroundColor: "transparent",
                    color: "#64748b", padding: "10px", borderRadius: "12px",
                    fontWeight: 600, border: "1px solid #e2e8f0",
                    cursor: "pointer", fontSize: "14px",
                  }}
                >
                  বন্ধ করুন
                </button>
              </div>
            )}

            {/* ── FORM ── */}
            {(status === "idle" || status === "loading" || status === "error") && (
              <>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", marginTop: "8px", lineHeight: 1.3 }}>
                    আপনার ই-কমার্স লস আজই বন্ধ করুন
                  </h2>
                  <p style={{ color: "#64748b", fontWeight: 500, fontSize: "14px" }}>
                    আপনার ব্যবসার জন্য সঠিক Automation Solution জানুন
                  </p>
                </div>

                {/* Show which service they're requesting */}
                <div style={{
                  backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: "12px", padding: "10px 16px", marginBottom: "20px",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span style={{ fontSize: "16px" }}>📋</span>
                  <span style={{ color: "#166534", fontSize: "13px", fontWeight: 600 }}>
                    সার্ভিস: {serviceType}
                  </span>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Hidden serviceType field */}
                  <input type="hidden" name="serviceType" value={serviceType} />

                  {/* ── ANTI-SPAM HONEYPOT ── */}
                  <div style={{ display: "none" }} aria-hidden="true">
                    <label htmlFor="website_url">Website URL (Leave empty)</label>
                    <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "#334155", fontWeight: 500, marginBottom: "6px", fontSize: "14px" }}>
                      পুরো নাম <span style={{ color: "#f43f5e" }}>*</span>
                    </label>
                    <input
                      type="text" name="name" required
                      placeholder="আপনার পুরো নাম লিখুন"
                      style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", color: "#1e293b", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "#334155", fontWeight: 500, marginBottom: "6px", fontSize: "14px" }}>
                      ইমেইল <span style={{ color: "#f43f5e" }}>*</span>
                    </label>
                    <input
                      type="email" name="email" required
                      placeholder="your@email.com"
                      style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", color: "#1e293b", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "#334155", fontWeight: 500, marginBottom: "6px", fontSize: "14px" }}>
                      ফোন নম্বর <span style={{ color: "#f43f5e" }}>*</span>
                    </label>
                    <input
                      type="tel" name="phone" required
                      placeholder="+880 1XXX-XXXXXX"
                      style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", color: "#1e293b", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "#334155", fontWeight: 500, marginBottom: "6px", fontSize: "14px" }}>
                      মেসেজ
                    </label>
                    <textarea
                      name="message" rows={3}
                      placeholder="আপনার মেসেজ পাঠান"
                      style={{ width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", color: "#1e293b", fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {status === "error" && (
                    <div style={{ color: "#f43f5e", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    style={{
                      backgroundColor: status === "loading" ? "#cbd5e1" : "#ff4e00",
                      color: "white", padding: "14px 24px", borderRadius: "12px",
                      fontWeight: 700, border: "none",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      marginTop: "8px", fontSize: "15px",
                      width: "auto", minWidth: "180px",
                    }}
                  >
                    {status === "loading" ? "অপেক্ষা করুন..." : "আবেদন জমা দিন"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
