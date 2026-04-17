"use client";
import { useState } from "react";

export function ClientSearch() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/fraud-stats/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to fetch data.");
      } else {
        setResult(data.data);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Search Input Banner */}
      <div style={{ background: "linear-gradient(135deg, #a855f7, #c084fc)", padding: "2rem", borderRadius: "12px", color: "white" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>Track Courier Orders</h3>
        <p style={{ margin: "0.5rem 0 1.5rem 0", opacity: 0.9 }}>Check courier order history & success rates by phone organically bypass limits.</p>
        
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", background: "white", padding: "0.5rem", borderRadius: "8px" }}>
          <input 
            type="text" 
            placeholder="01977757486" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", padding: "0.5rem 1rem", fontSize: "1rem", color: "#111" }}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              background: "linear-gradient(135deg, #c084fc, #d946ef)", 
              border: "none", 
              color: "white", 
              padding: "0.5rem 2rem", 
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Searching..." : "Search →"}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", border: "1px solid #f87171" }}>
          {error}
        </div>
      )}

      {/* Result Metrics */}
      {result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #3b82f6", background: "var(--background)" }}>
              <h4 style={{ color: "#3b82f6", margin: 0 }}>Total Orders</h4>
              <h2 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{result.total_parcel}</h2>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>All time</p>
            </div>
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #22c55e", background: "rgba(34, 197, 94, 0.05)" }}>
              <h4 style={{ color: "#22c55e", margin: 0 }}>Successful</h4>
              <h2 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#22c55e" }}>{result.success_parcel}</h2>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>Delivered</p>
            </div>
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #ff4d4d", background: "rgba(255, 77, 77, 0.05)" }}>
              <h4 style={{ color: "#ff4d4d", margin: 0 }}>Cancelled</h4>
              <h2 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#ff4d4d" }}>{result.cancelled_parcel}</h2>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>Failed</p>
            </div>
            <div className="card" style={{ textAlign: "center", borderTop: "4px solid #a855f7", background: "rgba(168, 85, 247, 0.05)" }}>
              <h4 style={{ color: "#a855f7", margin: 0 }}>Success Rate</h4>
              <h2 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#a855f7" }}>{result.success_ratio.toFixed(1)}%</h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            {/* Table */}
            <div className="card" style={{ overflowX: "auto", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#2563eb", color: "white" }}>
                    <th style={{ padding: "1rem", textAlign: "left" }}>COURIER</th>
                    <th style={{ padding: "1rem", textAlign: "center" }}>TOTAL</th>
                    <th style={{ padding: "1rem", textAlign: "center" }}>SUCCESS</th>
                    <th style={{ padding: "1rem", textAlign: "center" }}>CANCEL</th>
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
                    <tr key={c.name} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                      <td style={{ padding: "1rem", fontWeight: "bold" }}>{c.name}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>{c.t}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#22c55e" }}>{c.s}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#ff4d4d" }}>{c.c}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "rgba(0,0,0,0.05)", fontWeight: "bold" }}>
                    <td style={{ padding: "1rem" }}>Total</td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>{result.total_parcel}</td>
                    <td style={{ padding: "1rem", textAlign: "center", color: "#22c55e" }}>{result.success_parcel}</td>
                    <td style={{ padding: "1rem", textAlign: "center", color: "#ff4d4d" }}>{result.cancelled_parcel}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Donut Chart visual */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{ margin: "0 0 2rem 0", alignSelf: "flex-start", fontSize: "1.1rem" }}>Delivery Status</h3>
              {generateDonut(result.success_parcel, result.total_parcel)}
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                 <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "12px", height: "12px", background: "#22c55e", borderRadius: "2px" }}/> Successful</span>
                 <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "12px", height: "12px", background: "#ff4d4d", borderRadius: "2px" }}/> Cancelled</span>
              </div>
            </div>
          </div>

          {/* Dynamic Footer Banner */}
          <div style={{ 
            padding: "1rem", 
            borderRadius: "8px", 
            border: `1px solid ${result.success_ratio >= 70 ? "#4ade80" : result.success_ratio >= 40 ? "#facc15" : "#f87171"}`,
            background: result.success_ratio >= 70 ? "rgba(74, 222, 128, 0.1)" : result.success_ratio >= 40 ? "rgba(250, 204, 21, 0.1)" : "rgba(248, 113, 113, 0.1)",
            color: result.success_ratio >= 70 ? "#166534" : result.success_ratio >= 40 ? "#854d0e" : "#991b1b"
          }}>
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {result.success_ratio >= 70 ? "🛡️ High Success Rate" : result.success_ratio >= 40 ? "⚠️ Average Success Rate" : "🚨 Danger: Low Success Rate"}: {result.success_ratio.toFixed(1)}%
            </h4>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
              {result.success_ratio >= 70 ? "This customer appears entirely safe based on previous records deeply analyzed by RevenuePro." : "Exercise extreme caution accepting COD assignments for this dynamically evaluated profile."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
