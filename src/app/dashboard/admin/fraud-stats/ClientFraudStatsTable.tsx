"use client";
import { useState } from "react";
import { FraudStatActions } from "./FraudStatActions";

export function ClientFraudStatsTable({ initialStats }: { initialStats: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter stats based on search query matching the phone number
  const filteredStats = initialStats.filter((stat) => 
    stat.phone.includes(searchQuery.replace(/[^0-9]/g, ""))
  );

  return (
    <div>
      {/* Search Input Banner */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem 0.6rem 2.5rem",
              fontSize: "0.95rem",
              borderRadius: "8px",
              border: "1px solid var(--card-border)",
              background: "var(--background)",
              color: "var(--foreground)",
              outline: "none",
            }}
          />
        </div>
        {searchQuery && (
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
            Showing {filteredStats.length} results
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--card-border)", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Phone</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Domain</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Total</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Success</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Cancelled</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Ratio</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Pathao</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Steadfast</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Parceldex</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Redx</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Paperfly</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Carrybee</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Last Checked</th>
              <th style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map((stat) => {
              const ratioColor = stat.success_ratio >= 70 ? "var(--primary)" : stat.success_ratio >= 40 ? "#f59e0b" : "#ef4444";
              return (
                <tr key={stat.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>{stat.phone}</td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontSize: "0.8rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {stat.domain || stat.license?.domain || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 600 }}>{stat.total_parcel}</td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", color: "var(--primary)" }}>{stat.success_parcel}</td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", color: "#ef4444" }}>{stat.cancelled_parcel}</td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{
                      padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold",
                      background: stat.success_ratio >= 70 ? "rgba(16, 185, 129, 0.1)" : stat.success_ratio >= 40 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: ratioColor,
                    }}>
                      {stat.success_ratio.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: "var(--primary)" }}>{stat.pathao_success}</span> / <span style={{ color: "#ef4444" }}>{stat.pathao_cancel}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: "var(--primary)" }}>{stat.steadfast_success}</span> / <span style={{ color: "#ef4444" }}>{stat.steadfast_cancel}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: "var(--primary)" }}>{stat.parceldex_success}</span> / <span style={{ color: "#ef4444" }}>{stat.parceldex_cancel}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: "var(--primary)" }}>{stat.redx_success}</span> / <span style={{ color: "#ef4444" }}>{stat.redx_cancel}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: "var(--primary)" }}>{stat.paperfly_success}</span> / <span style={{ color: "#ef4444" }}>{stat.paperfly_cancel}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <span style={{ color: "var(--primary)" }}>{stat.carrybee_success}</span> / <span style={{ color: "#ef4444" }}>{stat.carrybee_cancel}</span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {new Date(stat.last_checked).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                    <FraudStatActions id={stat.id} phone={stat.phone} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredStats.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No records match this phone number.
          </div>
        )}
      </div>
    </div>
  );
}
