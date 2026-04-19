"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; icon: string };

const adminLinks: { section: string; links: NavLink[] }[] = [
  {
    section: "YOUR WORKSPACE",
    links: [
      { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
      { href: "/dashboard/admin/users", label: "System Users", icon: "👥" },
      { href: "/dashboard/admin/licenses", label: "Licenses", icon: "🔑" },
    ],
  },
  {
    section: "ADVANCED TOOLS",
    links: [
      { href: "/dashboard/admin/fraud-stats", label: "Fraud Statistics", icon: "🛡️" },
      { href: "/dashboard/admin/search", label: "Search Number", icon: "🔍" },
    ],
  },
  {
    section: "SETTINGS",
    links: [
      { href: "/dashboard/admin/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

const userSections: { section: string; links: NavLink[] }[] = [
  {
    section: "YOUR WORKSPACE",
    links: [
      { href: "/dashboard/user", label: "Dashboard", icon: "📊" },
    ],
  },
];

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const sections = isAdmin ? adminLinks : userSections;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {sections.map((section) => (
        <div key={section.section}>
          <div style={{
            padding: "0.75rem 0.75rem 0.4rem",
            fontSize: "0.6rem",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
          }}>
            {section.section}
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px", padding: 0, margin: 0 }}>
            {section.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: "none",
                      color: isActive ? "#059669" : "#475569",
                      background: isActive ? "rgba(16, 185, 129, 0.08)" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "0.95rem", width: "20px", textAlign: "center" }}>{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
