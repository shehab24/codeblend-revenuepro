"use client";
import { useTransition, useState } from "react";
import { deleteFraudStat, editFraudStatPhone } from "./actions";

export function FraudStatActions({ id, phone }: { id: string; phone: string }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [newPhone, setNewPhone] = useState(phone);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (!confirm("Are you sure you want to permanently delete this record?")) return;
    setShowMenu(false);
    startTransition(async () => {
      await deleteFraudStat(id);
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await editFraudStatPhone(id, newPhone);
      setIsEditing(false);
    });
  };

  if (isEditing) {
    return (
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          autoFocus
          style={{
            width: "130px",
            padding: "0.4rem 0.6rem",
            fontSize: "0.8rem",
            border: "2px solid var(--primary)",
            borderRadius: "6px",
            background: "var(--background)",
            color: "var(--foreground)",
            outline: "none",
          }}
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => { setIsEditing(false); setNewPhone(phone); setShowMenu(false); }}
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: "transparent",
            color: "var(--text-muted)",
            border: "1px solid var(--card-border)",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isPending}
        style={{
          padding: "0.3rem 0.6rem",
          fontSize: "0.85rem",
          background: "transparent",
          color: "var(--text-muted)",
          border: "1px solid var(--card-border)",
          borderRadius: "6px",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ⋯
      </button>

      {showMenu && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
          />
          <div style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "4px",
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            zIndex: 20,
            minWidth: "140px",
            overflow: "hidden",
          }}>
            <button
              onClick={() => { setIsEditing(true); setShowMenu(false); }}
              style={{
                display: "block",
                width: "100%",
                padding: "0.6rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 500,
                textAlign: "left",
                background: "transparent",
                color: "var(--foreground)",
                border: "none",
                cursor: "pointer",
                borderBottom: "1px solid var(--card-border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ✏️ Edit Phone
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: "block",
                width: "100%",
                padding: "0.6rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 500,
                textAlign: "left",
                background: "transparent",
                color: "#ef4444",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              🗑️ Delete Record
            </button>
          </div>
        </>
      )}
    </div>
  );
}
