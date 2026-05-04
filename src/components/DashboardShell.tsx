"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

type NavLink = { href: string; label: string; icon: React.ReactNode };

/* ── SVG Icons ── */
const Icon = {
  Dashboard: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  Users: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Key: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
  Shield: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  Search: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  CreditCard: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Settings: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.083 1.17-.188l.672-.558a1.123 1.123 0 011.563.06l.774.774a1.123 1.123 0 01.06 1.563l-.558.672c-.271.326-.305.776-.188 1.17s.506.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.384-.93.78s-.083.844.188 1.17l.558.672a1.123 1.123 0 01-.06 1.563l-.774.774a1.123 1.123 0 01-1.563.06l-.672-.558c-.326-.271-.776-.305-1.17-.188s-.71.506-.78.93l-.15.894c-.09.542-.56.94-1.109.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.148-.894c-.071-.424-.385-.764-.781-.93s-.844-.083-1.17.188l-.672.558a1.123 1.123 0 01-1.563-.06l-.774-.774a1.123 1.123 0 01-.06-1.563l.558-.672c.271-.326.305-.776.188-1.17s-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78s.083-.843-.188-1.17l-.558-.671a1.123 1.123 0 01.06-1.563l.774-.774a1.123 1.123 0 011.563-.06l.672.558c.325.271.776.305 1.17.188s.71-.506.78-.93l.148-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Collapse: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>,
  Expand: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>,
  Help: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  Profile: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Bug: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152-6.135 3.31 3.31 0 00-.538-.515A8.962 8.962 0 0012 5.25a8.962 8.962 0 00-6.517 2.79 3.31 3.31 0 00-.538.515 23.91 23.91 0 01-1.152 6.135A24.087 24.087 0 0112 12.75z" /></svg>,
  Logout: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
  ChevronDown: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  ClipboardList: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  PlusCircle: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  CloudDownload: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>,
};

const adminLinks: { section: string; links: NavLink[] }[] = [
  {
    section: "YOUR WORKSPACE",
    links: [
      { href: "/dashboard/admin", label: "Dashboard", icon: Icon.Dashboard },
      { href: "/dashboard/admin/users", label: "System Users", icon: Icon.Users },
      { href: "/dashboard/admin/licenses", label: "Licenses", icon: Icon.Key },
      { href: "/dashboard/admin/requests", label: "Service Requests", icon: Icon.ClipboardList },
      { href: "/dashboard/admin/transactions", label: "Transactions", icon: Icon.CreditCard },
    ],
  },
  {
    section: "ADVANCED TOOLS",
    links: [
      { href: "/dashboard/admin/fraud-stats", label: "Fraud Statistics", icon: Icon.Shield },
      { href: "/dashboard/admin/search", label: "Search Number", icon: Icon.Search },
    ],
  },
  {
    section: "SETTINGS",
    links: [
      { href: "/dashboard/admin/settings", label: "Settings", icon: Icon.Settings },
    ],
  },
];

const userSections: { section: string; links: NavLink[] }[] = [
  {
    section: "YOUR WORKSPACE",
    links: [
      { href: "/dashboard/user", label: "Dashboard", icon: Icon.Dashboard },
      { href: "/dashboard/user/requests", label: "My Requests", icon: Icon.ClipboardList },
      { href: "/dashboard/user/services", label: "Get Service", icon: Icon.PlusCircle },
      { href: "/dashboard/user/transactions", label: "Billing & Payments", icon: Icon.CreditCard },
    ],
  },
  {
    section: "PRODUCTS",
    links: [
      { href: "/dashboard/user/revenuepro", label: "Revenue Pro", icon: Icon.CloudDownload },
    ],
  },
];

interface DashboardShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
  userImageUrl?: string;
}

export function DashboardShell({ children, isAdmin, userName, userEmail, userImageUrl }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const sections = isAdmin ? adminLinks : userSections;
  const profileRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="dashboard-light-vars flex min-h-[100dvh] bg-slate-50 print:bg-white print:block overflow-x-hidden relative">
      {/* ── MOBILE BACKDROP ── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed md:sticky md:top-0 inset-y-0 left-0 z-50 h-[100dvh] md:h-screen flex flex-col bg-white border-r border-slate-100 transition-all duration-300 shrink-0 
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "md:w-[68px] w-[240px]" : "w-[240px]"} 
        print:hidden
      `}>

        {/* Logo — exact same h-14 as header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              C
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="font-bold text-[0.85rem] text-slate-800 leading-tight">CodeBlend</div>
                <div className="text-[0.6rem] text-slate-400 font-medium">Digital Solutions</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.section} className="mb-1">
              {!collapsed && (
                <div className="px-3 pt-4 pb-2 text-[0.6rem] font-semibold text-slate-400 uppercase tracking-[1.2px] select-none">
                  {section.section}
                </div>
              )}
              <ul className="flex flex-col gap-1 list-none p-0 m-0">
                {section.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-all
                          ${isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-normal"}
                          ${collapsed ? "justify-center !px-2" : ""}
                        `}
                        title={collapsed ? link.label : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="shrink-0 text-current">{link.icon}</span>
                        {!collapsed && link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="hidden md:flex border-t border-slate-100 p-2 flex-col gap-px">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer border-none bg-transparent w-full ${collapsed ? "justify-center !px-2" : "text-left"}`}
          >
            <span className="shrink-0">{collapsed ? Icon.Expand : Icon.Collapse}</span>
            {!collapsed && "Collapse"}
          </button>
          <Link
            href="https://wa.me/+8801XXXXXXXXX"
            target="_blank"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all no-underline ${collapsed ? "justify-center !px-2" : ""}`}
            title="Help Center"
          >
            <span className="shrink-0">{Icon.Help}</span>
            {!collapsed && "Help Center"}
          </Link>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 md:pb-0 relative pt-14 md:pt-0 h-[100dvh] md:h-screen overflow-y-auto w-full">
        {/* Header — exact same h-14 as sidebar logo */}
        <header className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto md:w-full h-14 flex items-center justify-between px-4 sm:px-6 bg-white/95 backdrop-blur-sm border-b md:bg-white border-slate-100 shrink-0 z-30 print:hidden">
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              className="md:hidden p-2 -ml-2 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex md:hidden items-center justify-center text-white font-extrabold text-xs shrink-0">
              C
            </div>
            <span className="text-[1rem] font-bold text-slate-800 md:hidden">CodeBlend</span>
            <span className="hidden md:block text-slate-400 font-medium text-sm">Dashboard</span>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 cursor-pointer border-none bg-transparent p-0"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-emerald-500/20">
                {userImageUrl ? (
                  <img src={userImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-700 font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-slate-400">{Icon.ChevronDown}</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/50 z-50 py-1.5">
                <Link href="/dashboard/user" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 no-underline transition">
                  <span className="text-slate-400">{Icon.Profile}</span> Profile
                </Link>
                <Link href="https://wa.me/+8801XXXXXXXXX" target="_blank" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 no-underline transition">
                  <span className="text-slate-400">{Icon.Help}</span> Help Center
                </Link>

                <div className="border-t border-slate-100 my-1" />
                <div className="px-4 py-1 text-[0.6rem] text-slate-300">Version 1.0.0</div>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full border-none bg-transparent cursor-pointer text-left transition"
                >
                  <span>{Icon.Logout}</span> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
