"use client";

import { useState } from "react";

export function ClientSearch() {
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("auto"); // "auto" | "pathao" | "steadfast" | "bdcourier"
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!phone) return;
    setIsLoading(true);
    setError("");
    if (!force) setResult(null);

    try {
      const res = await fetch("/api/v1/fraud-stats/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, provider, forceRefresh: force }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to fetch data.");
      } else {
        setResult(data.data);
        setSource(data.source || "");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // SVG Donut Generator
  const generateDonut = (success: number, total: number) => {
    if (total === 0) return null;
    const ratio = success / total;
    const strokeDasharray = `${ratio * 100} ${100 - (ratio * 100)}`;
    return (
      <svg viewBox="0 0 36 36" style={{ width: "150px", height: "150px" }}>
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ff4d4d" strokeWidth="4" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray={strokeDasharray} />
      </svg>
    );
  };

  const getSourceBadgeText = (src: string) => {
    switch (src) {
      case "pathao_direct": return "⚡ Pathao Direct API";
      case "pathao_fallback": return "⚡ Pathao Fallback API";
      case "steadfast_direct": return "📦 Steadfast Direct API";
      case "steadfast_fallback": return "📦 Steadfast Fallback API";
      case "bdcourier_live_fetch": return "🚚 BD Courier Live Fetch";
      case "cache": return "💡 Cached Database";
      default: return `🔍 ${src}`;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Search Input Banner with Gradient UI */}
      <div style={{ background: "linear-gradient(135deg, #a855f7, #c084fc)", padding: "2rem", borderRadius: "16px", color: "white", boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.3)" }}>
        <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700" }}>Track Courier Orders</h3>
        <p style={{ margin: "0.5rem 0 1.5rem 0", opacity: 0.95, fontSize: "0.95rem" }}>
          Check courier order history & success rates by phone number. Select platform target or use auto failover.
        </p>
        
        <form onSubmit={(e) => handleSearch(e, false)} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", background: "white", padding: "0.6rem", borderRadius: "12px", alignItems: "center" }}>
          {/* Platform Selector Dropdown */}
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#0f172a",
              fontWeight: "700",
              fontSize: "0.875rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="auto">🌐 Auto (All Couriers)</option>
            <option value="pathao">⚡ Pathao API Only</option>
            <option value="steadfast">📦 Steadfast API Only</option>
            <option value="bdcourier">🚚 BD Courier Only</option>
          </select>

          <input 
            type="text" 
            placeholder="01977757486" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", padding: "0.5rem 1rem", fontSize: "1rem", color: "#111", minWidth: "180px" }}
          />

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              background: "linear-gradient(135deg, #c084fc, #d946ef)", 
              border: "none", 
              color: "white", 
              padding: "0.65rem 2rem", 
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "0.95rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(217, 70, 239, 0.3)"
            }}
          >
            {isLoading ? "Searching..." : "Search →"}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: "1rem 1.25rem", background: "#fee2e2", color: "#991b1b", borderRadius: "12px", border: "1px solid #f87171", fontWeight: 500, fontSize: "0.9rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Result Metrics */}
      {result && (
        <>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: "0.85rem 1.25rem", 
            background: "#eff6ff", 
            color: "#1e40af", 
            borderRadius: "12px", 
            fontSize: "0.875rem",
            border: "1px solid #bfdbfe",
            fontWeight: 500,
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Source: <strong>{getSourceBadgeText(source)}</strong></span>
              {result.last_checked && (
                <span style={{ opacity: 0.8 }}>(Checked: {new Date(result.last_checked).toLocaleString()})</span>
              )}
            </div>

            {source === "cache" && (
              <button 
                onClick={() => handleSearch(undefined, true)} 
                disabled={isLoading}
                style={{ 
                  background: "#3b82f6", 
                  color: "white", 
                  border: "none", 
                  padding: "0.45rem 1.25rem", 
                  borderRadius: "8px", 
                  fontWeight: "bold", 
                  fontSize: "0.8rem",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.2s"
                }}
              >
                {isLoading ? "Refreshing..." : "Refresh Live Stats"}
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #3b82f6", background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 style={{ color: "#3b82f6", margin: 0, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.5px" }}>Total Orders</h4>
              <h2 style={{ fontSize: "2.25rem", margin: "0.4rem 0", fontWeight: "800", color: "#0f172a" }}>{result.total_parcel}</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>All time recorded</p>
            </div>
            
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #22c55e", background: "rgba(34, 197, 94, 0.04)", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 style={{ color: "#22c55e", margin: 0, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.5px" }}>Successful</h4>
              <h2 style={{ fontSize: "2.25rem", margin: "0.4rem 0", fontWeight: "800", color: "#22c55e" }}>{result.success_parcel}</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Delivered orders</p>
            </div>
            
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #ff4d4d", background: "rgba(255, 77, 77, 0.04)", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 style={{ color: "#ff4d4d", margin: 0, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.5px" }}>Cancelled</h4>
              <h2 style={{ fontSize: "2.25rem", margin: "0.4rem 0", fontWeight: "800", color: "#ff4d4d" }}>{result.cancelled_parcel}</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Returned / Failed</p>
            </div>
            
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #a855f7", background: "rgba(168, 85, 247, 0.04)", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 style={{ color: "#a855f7", margin: 0, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.5px" }}>Success Rate</h4>
              <h2 style={{ fontSize: "2.25rem", margin: "0.4rem 0", fontWeight: "800", color: "#a855f7" }}>{result.success_ratio.toFixed(1)}%</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Completion ratio</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Courier Table */}
            <div className="card" style={{ overflowX: "auto", padding: 0, background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#2563eb", color: "white" }}>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.8rem", letterSpacing: "0.5px" }}>COURIER</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "center", fontSize: "0.8rem", letterSpacing: "0.5px" }}>TOTAL</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "center", fontSize: "0.8rem", letterSpacing: "0.5px" }}>SUCCESS</th>
                    <th style={{ padding: "0.85rem 1rem", textAlign: "center", fontSize: "0.8rem", letterSpacing: "0.5px" }}>CANCEL</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Pathao", t: result.pathao_success + result.pathao_cancel, s: result.pathao_success, c: result.pathao_cancel },
                    { name: "Steadfast", t: result.steadfast_success + result.steadfast_cancel, s: result.steadfast_success, c: result.steadfast_cancel },
                    { name: "ParcelDex", t: result.parceldex_success + result.parceldex_cancel, s: result.parceldex_success, c: result.parceldex_cancel },
                    { name: "Redx", t: result.redx_success + result.redx_cancel, s: result.redx_success, c: result.redx_cancel },
                    { name: "PaperFly", t: result.paperfly_success + result.paperfly_cancel, s: result.paperfly_success, c: result.paperfly_cancel },
                    { name: "CarryBee", t: result.carrybee_success + result.carrybee_cancel, s: result.carrybee_success, c: result.carrybee_cancel }
                  ].map((c, i) => (
                    <tr key={c.name} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "transparent" : "rgba(248, 250, 252, 0.7)" }}>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: "bold", color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center", fontWeight: "600" }}>{c.t}</td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center", color: "#22c55e", fontWeight: "bold" }}>{c.s}</td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center", color: "#ff4d4d", fontWeight: "bold" }}>{c.c}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f8fafc", fontWeight: "bold", borderTop: "2px solid #e2e8f0" }}>
                    <td style={{ padding: "0.85rem 1rem", color: "#0f172a" }}>Total</td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>{result.total_parcel}</td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center", color: "#22c55e" }}>{result.success_parcel}</td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center", color: "#ff4d4d" }}>{result.cancelled_parcel}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Donut Chart visual */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>Delivery Status</h3>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {generateDonut(result.success_parcel, result.total_parcel)}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#1e293b" }}>
                  <div style={{ width: "12px", height: "12px", background: "#22c55e", borderRadius: "3px" }}/> Successful
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#1e293b" }}>
                  <div style={{ width: "12px", height: "12px", background: "#ff4d4d", borderRadius: "3px" }}/> Cancelled
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div style={{ 
            padding: "1.25rem", 
            borderRadius: "12px", 
            border: `1px solid ${result.success_ratio >= 70 ? "#4ade80" : result.success_ratio >= 40 ? "#facc15" : "#f87171"}`,
            background: result.success_ratio >= 70 ? "rgba(74, 222, 128, 0.1)" : result.success_ratio >= 40 ? "rgba(250, 204, 21, 0.1)" : "rgba(248, 113, 113, 0.1)",
            color: result.success_ratio >= 70 ? "#166534" : result.success_ratio >= 40 ? "#854d0e" : "#991b1b"
          }}>
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", fontWeight: "700" }}>
              {result.success_ratio >= 70 ? "🛡️ High Success Rate" : result.success_ratio >= 40 ? "⚠️ Average Success Rate" : "🚨 Danger: Low Success Rate"}: {result.success_ratio.toFixed(1)}%
            </h4>
            <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.875rem", opacity: 0.9, lineHeight: "1.5" }}>
              {result.success_ratio >= 70 ? "This customer appears entirely safe based on previous records deeply analyzed by RevenuePro." : "Exercise extreme caution accepting COD assignments for this dynamically evaluated profile."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
