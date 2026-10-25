"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CloudArrowDownIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  PlusIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UsersIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type IconType = React.ComponentType<{ className?: string }>;
type NavLink = { href: string; label: string; icon: IconType; exact?: boolean };
type NavSection = { section: string; links: NavLink[] };

const adminSections: NavSection[] = [
  {
    section: "Overview",
    links: [{ href: "/dashboard/admin", label: "Dashboard", icon: Squares2X2Icon, exact: true }],
  },
  {
    section: "Customers & billing",
    links: [
      { href: "/dashboard/admin/users", label: "System Users", icon: UsersIcon },
      { href: "/dashboard/admin/licenses", label: "Licenses", icon: KeyIcon },
      { href: "/dashboard/admin/requests", label: "Service Requests", icon: ClipboardDocumentListIcon },
      { href: "/dashboard/admin/invoices", label: "Guest Billing", icon: DocumentTextIcon },
      { href: "/dashboard/admin/transactions", label: "Transactions", icon: CreditCardIcon },
    ],
  },
  {
    section: "Tools",
    links: [
      { href: "/dashboard/admin/fraud-stats", label: "Fraud Statistics", icon: ShieldCheckIcon },
      { href: "/dashboard/admin/search", label: "Search Number", icon: MagnifyingGlassIcon },
      { href: "/dashboard/admin/showcase", label: "Showcase Customers", icon: BuildingStorefrontIcon },
    ],
  },
  {
    section: "System",
    links: [{ href: "/dashboard/admin/settings", label: "Settings", icon: Cog6ToothIcon }],
  },
];

const userSections: NavSection[] = [
  {
    section: "Workspace",
    links: [
      { href: "/dashboard/user", label: "Dashboard", icon: Squares2X2Icon, exact: true },
      { href: "/dashboard/user/requests", label: "My Services", icon: ClipboardDocumentListIcon },
      { href: "/dashboard/user/services", label: "Get Service", icon: PlusIcon },
      { href: "/dashboard/user/transactions", label: "Billing & Payments", icon: WalletIcon },
    ],
  },
  {
    section: "Products",
    links: [
      { href: "/dashboard/user/revenuepro", label: "Revenue Pro", icon: CloudArrowDownIcon },
      { href: "/dashboard/user/expense-tracker", label: "Expense Tracker", icon: ChartPieIcon },
      { href: "/dashboard/user/payment-gateway", label: "CodePay", icon: DevicePhoneMobileIcon },
      { href: "/dashboard/user/tutorials", label: "Tutorials", icon: PlayCircleIcon },
    ],
  },
  {
    section: "Account",
    links: [{ href: "/dashboard/user/profile", label: "Profile", icon: UserCircleIcon }],
  },
];

const HELP_URL = "https://wa.me/8801570296656";

function isActive(link: NavLink, pathname: string) {
  return link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

interface DashboardShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
  userImageUrl?: string;
  hasPhone?: boolean;
  expenseTrackerAllowed?: boolean;
  bkashTrackerAllowed?: boolean;
  revenueProAllowed?: boolean;
}

function Avatar({ name, imageUrl, size = 36 }: { name: string; imageUrl?: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-white/10"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted avatar
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-white">{name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

export function DashboardShell({
  children,
  isAdmin,
  userName,
  userEmail,
  userImageUrl,
  hasPhone = true,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const sections = isAdmin ? adminSections : userSections;

  const profileRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();

  // Redirect users who don't have phone set to their profile page, except admins
  useEffect(() => {
    if (!isAdmin && !hasPhone && pathname !== "/dashboard/user/profile") {
      router.replace("/dashboard/user/profile");
    }
  }, [isAdmin, hasPhone, pathname, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Breadcrumb: the deepest nav link matching the current path.
  const allLinks = sections.flatMap((s) => s.links);
  const current = allLinks.filter((l) => isActive(l, pathname)).sort((a, b) => b.href.length - a.href.length)[0];
  const isSubPage = current && pathname !== current.href;
  const homeHref = isAdmin ? "/dashboard/admin" : "/dashboard/user";

  const isBlocked = !isAdmin && !hasPhone && pathname !== "/dashboard/user/profile";

  if (isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">মোবাইল নম্বর যোগ করা আবশ্যক</h3>
            <p className="text-sm text-slate-500">
              আপনার অ্যাকাউন্টের নিরাপত্তা এবং আমাদের সার্ভিস প্রদানের সুবিধার্থে একটি সচল মোবাইল নম্বর যোগ করা আবশ্যক। আপনাকে প্রোফাইল পেজে রিডাইরেক্ট করা হচ্ছে...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500"></span>
            প্রোফাইলে রিডাইরেক্ট হচ্ছে
          </div>
        </div>
      </div>
    );
  }

  const navItem = (link: NavLink) => {
    const active = isActive(link, pathname);
    const Icon = link.icon;
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          title={collapsed ? link.label : undefined}
          onClick={() => setMobileMenuOpen(false)}
          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-all ${
            active ? "bg-white/[0.08] font-medium text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
          } ${collapsed ? "md:justify-center md:px-2" : ""}`}
        >
          {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400" />}
          <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-emerald-300" : "text-slate-500 group-hover:text-slate-300"}`} />
          <span className={collapsed ? "md:hidden" : ""}>{link.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="dashboard-light-vars relative flex min-h-[100dvh] overflow-x-hidden bg-[#f6f7f9] print:block print:min-h-0 print:overflow-visible print:bg-white">
      {/* ── MOBILE BACKDROP ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] shrink-0 flex-col overflow-hidden bg-slate-950 text-white transition-all duration-300 md:sticky md:top-0 md:h-screen print:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-[264px] md:w-[76px]" : "w-[264px]"}`}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Brand */}
        <div className="relative flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base font-semibold ring-1 ring-white/15">
              <span className="bg-gradient-to-br from-emerald-300 to-teal-400 bg-clip-text text-transparent">C</span>
            </span>
            <span className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
              <span className="block truncate text-[15px] font-semibold leading-tight tracking-tight">CodeBlend</span>
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-1.5 py-px text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/20">
                {isAdmin ? "Admin console" : "Client portal"}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 md:hidden"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-3 pb-4 pt-2">
          {sections.map((section) => (
            <div key={section.section} className="mt-4 first:mt-1">
              <div className={`mb-1.5 px-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500 ${collapsed ? "md:hidden" : ""}`}>
                {section.section}
              </div>
              {collapsed && <div className="mx-3 mb-2 hidden h-px bg-white/10 md:block" />}
              <ul className="flex flex-col gap-0.5">{section.links.map(navItem)}</ul>
            </div>
          ))}
        </nav>

        {/* Help card */}
        <div className={`relative px-3 pb-3 ${collapsed ? "md:hidden" : ""}`}>
          <a
            href={HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 p-3.5 ring-1 ring-emerald-400/20 transition hover:ring-emerald-400/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-emerald-300" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">Need help?</span>
              <span className="block truncate text-[11px] text-slate-400">Chat with us on WhatsApp</span>
            </span>
          </a>
        </div>

        {/* User + collapse */}
        <div className="relative border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 rounded-xl p-1.5 ${collapsed ? "md:justify-center" : ""}`}>
            <Avatar name={userName} imageUrl={userImageUrl} />
            <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-[13px] font-medium">{userName}</p>
              <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              title="Log out"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-rose-300 cursor-pointer ${collapsed ? "md:hidden" : ""}`}
            >
              <ArrowLeftStartOnRectangleIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 hidden w-full items-center justify-center gap-2 rounded-lg py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-white/5 hover:text-slate-300 md:flex cursor-pointer"
          >
            {collapsed ? <ChevronDoubleRightIcon className="h-4 w-4" /> : <><ChevronDoubleLeftIcon className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="relative flex h-[100dvh] w-full min-w-0 flex-1 flex-col overflow-y-auto pt-16 md:h-screen md:pt-0 print:h-auto print:overflow-visible print:pt-0">
        {/* Header */}
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6 md:sticky md:left-auto md:right-auto print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 md:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
              <Link href={homeHref} className="hidden shrink-0 text-slate-400 hover:text-slate-700 sm:inline">
                {isAdmin ? "Admin" : "Portal"}
              </Link>
              {current && (
                <>
                  <ChevronRightIcon className="hidden h-3.5 w-3.5 shrink-0 text-slate-300 sm:block" />
                  {isSubPage ? (
                    <Link href={current.href} className="truncate text-slate-400 hover:text-slate-700">{current.label}</Link>
                  ) : (
                    <span className="truncate font-semibold text-slate-900">{current.label}</span>
                  )}
                </>
              )}
              {isSubPage && (
                <>
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  <span className="truncate font-semibold text-slate-900">Details</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" /> View website
            </Link>
            {isAdmin ? (
              <Link
                href="/dashboard/admin/search"
                className="hidden items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-[13px] text-slate-500 ring-1 ring-slate-200/70 transition hover:bg-white hover:text-slate-800 sm:inline-flex"
              >
                <MagnifyingGlassIcon className="h-4 w-4" /> Search number
              </Link>
            ) : (
              <Link
                href="/dashboard/user/services"
                className="hidden items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] transition hover:bg-slate-800 sm:inline-flex"
              >
                <PlusIcon className="h-4 w-4" /> New request
              </Link>
            )}

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100 cursor-pointer"
                aria-expanded={profileOpen}
              >
                <Avatar name={userName} imageUrl={userImageUrl} size={32} />
                <ChevronDownIcon className={`h-3.5 w-3.5 text-slate-400 transition ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200">
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
                    <Avatar name={userName} imageUrl={userImageUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="truncate text-xs text-slate-500">{userEmail}</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link href="/dashboard/user/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50">
                      <UserCircleIcon className="h-[18px] w-[18px] text-slate-400" /> Profile
                    </Link>
                    <a href={HELP_URL} target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50">
                      <ChatBubbleLeftRightIcon className="h-[18px] w-[18px] text-slate-400" /> Help Center
                    </a>
                    <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50">
                      <ArrowTopRightOnSquareIcon className="h-[18px] w-[18px] text-slate-400" /> View website
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 p-1.5">
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                    >
                      <ArrowLeftStartOnRectangleIcon className="h-[18px] w-[18px]" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {!hasPhone && pathname !== "/dashboard/user/profile" && (
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 sm:text-base">আপনার প্রোফাইলে ফোন নম্বর সেট করা নেই!</h4>
                  <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">নিরাপত্তা ও ভেরিফিকেশনের জন্য প্রোফাইল সেকশনে একটি সচল ফোন নম্বর যোগ করা আবশ্যিক।</p>
                </div>
              </div>
              <Link
                href="/dashboard/user/profile"
                className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 sm:w-auto"
              >
                ফোন নম্বর সেট করুন
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
