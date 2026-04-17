"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; highlight?: boolean };

const adminLinks: NavLink[] = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "System Users" },
  { href: "/dashboard/admin/licenses", label: "Licenses (WP Auth)" },
  { href: "/dashboard/admin/fraud-stats", label: "Fraud Statistics" },
  { href: "/dashboard/admin/search", label: "🔍 Search Number", highlight: true },
  { href: "/dashboard/admin/settings", label: "Global Settings" },
];

const userLinks: NavLink[] = [
  { href: "/dashboard/user", label: "Overview" },
];

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        const isSearch = link.highlight;

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              style={{
                display: "block",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: isActive ? "700" : "500",
                textDecoration: "none",
                color: isActive
                  ? (isSearch ? "white" : "var(--primary)")
                  : "var(--foreground)",
                background: isActive
                  ? (isSearch ? "var(--primary)" : "rgba(16, 185, 129, 0.1)")
                  : "transparent",
                borderLeft: isActive && !isSearch ? "3px solid var(--primary)" : "3px solid transparent",
                transition: "all 0.15s ease",
                marginTop: isSearch ? "0.75rem" : "0",
              }}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
