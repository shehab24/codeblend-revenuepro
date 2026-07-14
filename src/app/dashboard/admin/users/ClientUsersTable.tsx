"use client";

import React, { useState, useTransition, useMemo } from "react";
import { 
  toggleUserRole, 
  toggleUserDownloadAccess, 
  toggleUserExpenseTrackerAccess, 
  toggleUserBkashTrackerAccess, 
  toggleUserRevenueProAccess,
  toggleUserCodePayActive
} from "./actions";

type UserWithLicensesCount = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  downloadAllowed: boolean;
  expenseTrackerAllowed: boolean;
  bkashTrackerAllowed: boolean;
  revenueProAllowed: boolean;
  codepayActive: boolean;
  createdAt: Date | string;
  _count: {
    licenses: number;
  };
};

type Props = {
  initialUsers: UserWithLicensesCount[];
  currentUserId: string;
};

// Premium Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
  disabled,
  activeColor = "bg-emerald-500",
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      disabled={disabled}
      type="button"
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? activeColor : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// Avatar Initials Helpers
function getAvatarGradient(nameOrEmail: string) {
  const code = nameOrEmail.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    "from-purple-500 to-indigo-500",
    "from-emerald-400 to-teal-600",
    "from-orange-400 to-red-500",
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-500",
    "from-violet-500 to-fuchsia-600"
  ];
  return gradients[code % gradients.length];
}

function getInitials(name: string | null, email: string) {
  if (name && name !== "User") {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

export function ClientUsersTable({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState<UserWithLicensesCount[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [downloadFilter, setDownloadFilter] = useState("all");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [expenseTrackerFilter, setExpenseTrackerFilter] = useState("all");
  const [bkashTrackerFilter, setBkashTrackerFilter] = useState("all");
  const [revenueProFilter, setRevenueProFilter] = useState("all");

  // Track which user's 3-dot dropdown menu is open
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isPending, startTransition] = useTransition();

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin" || u.role === "ADMIN").length;
    const downloads = users.filter((u) => u.downloadAllowed).length;
    const codepay = users.filter((u) => u.bkashTrackerAllowed).length;
    const revenuepro = users.filter((u) => u.revenueProAllowed).length;
    return { total, admins, downloads, codepay, revenuepro };
  }, [users]);

  // Reset pagination when search query or filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const handleDownloadFilterChange = (val: string) => {
    setDownloadFilter(val);
    setCurrentPage(1);
  };

  const handleLicenseFilterChange = (val: string) => {
    setLicenseFilter(val);
    setCurrentPage(1);
  };

  const handleExpenseTrackerFilterChange = (val: string) => {
    setExpenseTrackerFilter(val);
    setCurrentPage(1);
  };

  const handleBkashTrackerFilterChange = (val: string) => {
    setBkashTrackerFilter(val);
    setCurrentPage(1);
  };

  const handleRevenueProFilterChange = (val: string) => {
    setRevenueProFilter(val);
    setCurrentPage(1);
  };

  // 1. Filter users
  const filteredUsers = users.filter((u) => {
    // Search match
    const nameMatch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const emailMatch = u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = u.phone?.includes(searchQuery) || false;
    const searchMatch = searchQuery === "" || nameMatch || emailMatch || phoneMatch;

    // Role filter match
    const isAdmin = u.role === "admin" || u.role === "ADMIN";
    const roleMatch =
      roleFilter === "all" ||
      (roleFilter === "admin" && isAdmin) ||
      (roleFilter === "user" && !isAdmin);

    // Download filter match
    const downloadMatch =
      downloadFilter === "all" ||
      (downloadFilter === "allowed" && u.downloadAllowed) ||
      (downloadFilter === "restricted" && !u.downloadAllowed);

    // License filter match
    const licenseMatch =
      licenseFilter === "all" ||
      (licenseFilter === "yes" && u._count.licenses > 0) ||
      (licenseFilter === "no" && u._count.licenses === 0);

    // Expense Tracker filter match
    const expenseTrackerMatch =
      expenseTrackerFilter === "all" ||
      (expenseTrackerFilter === "allowed" && u.expenseTrackerAllowed) ||
      (expenseTrackerFilter === "restricted" && !u.expenseTrackerAllowed);

    // bKash Tracker filter match (CodePay)
    const bkashTrackerMatch =
      bkashTrackerFilter === "all" ||
      (bkashTrackerFilter === "allowed" && u.bkashTrackerAllowed) ||
      (bkashTrackerFilter === "restricted" && !u.bkashTrackerAllowed);

    // Revenue Pro filter match
    const revenueProMatch =
      revenueProFilter === "all" ||
      (revenueProFilter === "allowed" && u.revenueProAllowed) ||
      (revenueProFilter === "restricted" && !u.revenueProAllowed);

    return searchMatch && roleMatch && downloadMatch && licenseMatch && expenseTrackerMatch && bkashTrackerMatch && revenueProMatch;
  });

  // 2. Pagination math
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // 3. Action dispatchers
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" || currentRole === "ADMIN" ? "USER" : "ADMIN";
    
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("newRole", newRole);
        await toggleUserRole(formData);
      } catch (err) {
        console.error("Failed to toggle role:", err);
        setUsers(initialUsers);
      }
    });
  };

  const handleToggleDownloads = async (userId: string, currentAllow: boolean) => {
    const newAllow = !currentAllow;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, downloadAllowed: newAllow } : u))
    );

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("allow", newAllow ? "true" : "false");
        await toggleUserDownloadAccess(formData);
      } catch (err) {
        console.error("Failed to toggle download access:", err);
        setUsers(initialUsers);
      }
    });
  };

  const handleToggleExpenseTracker = async (userId: string, currentAllow: boolean) => {
    const newAllow = !currentAllow;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, expenseTrackerAllowed: newAllow } : u))
    );

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("allow", newAllow ? "true" : "false");
        await toggleUserExpenseTrackerAccess(formData);
      } catch (err) {
        console.error("Failed to toggle expense tracker access:", err);
        setUsers(initialUsers);
      }
    });
  };

  const handleToggleBkashTracker = async (userId: string, currentAllow: boolean) => {
    const newAllow = !currentAllow;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, bkashTrackerAllowed: newAllow } : u))
    );

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("allow", newAllow ? "true" : "false");
        await toggleUserBkashTrackerAccess(formData);
      } catch (err) {
        console.error("Failed to toggle bkash tracker access:", err);
        setUsers(initialUsers);
      }
    });
  };

  const handleToggleRevenuePro = async (userId: string, currentAllow: boolean) => {
    const newAllow = !currentAllow;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, revenueProAllowed: newAllow } : u))
    );

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("allow", newAllow ? "true" : "false");
        await toggleUserRevenueProAccess(formData);
      } catch (err) {
        console.error("Failed to toggle revenue pro access:", err);
        setUsers(initialUsers);
      }
    });
  };

  const handleToggleCodePayActive = async (userId: string, currentActive: boolean) => {
    const newActive = !currentActive;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, codepayActive: newActive } : u))
    );

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("active", newActive ? "true" : "false");
        await toggleUserCodePayActive(formData);
      } catch (err) {
        console.error("Failed to toggle CodePay active status:", err);
        setUsers(initialUsers);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setDownloadFilter("all");
    setLicenseFilter("all");
    setExpenseTrackerFilter("all");
    setBkashTrackerFilter("all");
    setRevenueProFilter("all");
    setCurrentPage(1);
  };

  const isFilterActive =
    searchQuery !== "" ||
    roleFilter !== "all" ||
    downloadFilter !== "all" ||
    licenseFilter !== "all" ||
    expenseTrackerFilter !== "all" ||
    bkashTrackerFilter !== "all" ||
    revenueProFilter !== "all";

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics / KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-400">active</span>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-emerald-700/80 uppercase tracking-wider">Admins</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-700">{stats.admins}</span>
            <span className="text-xs text-emerald-500">staff</span>
          </div>
        </div>

        {/* Revenue Pro */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-blue-700/80 uppercase tracking-wider">Revenue Pro</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-700">{stats.revenuepro}</span>
            <span className="text-xs text-blue-500">enabled</span>
          </div>
        </div>

        {/* CodePay */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-indigo-700/80 uppercase tracking-wider">CodePay</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-indigo-700">{stats.codepay}</span>
            <span className="text-xs text-indigo-500">active</span>
          </div>
        </div>

        {/* Downloads */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1 shadow-xs">
          <span className="text-xs font-semibold text-orange-700/80 uppercase tracking-wider">Downloads</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-orange-700">{stats.downloads}</span>
            <span className="text-xs text-orange-500">permitted</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Page Size Select */}
          <div className="w-full md:w-44 shrink-0">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition cursor-pointer font-medium"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Grid */}
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Filters Panel</span>
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-extrabold text-rose-500 hover:text-rose-700 transition flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 hover:bg-rose-100/70"
              >
                Reset All Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Role Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </div>

            {/* Downloads Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Downloads</label>
              <select
                value={downloadFilter}
                onChange={(e) => handleDownloadFilterChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="all">All Access</option>
                <option value="allowed">Allowed</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            {/* Licenses Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Licenses</label>
              <select
                value={licenseFilter}
                onChange={(e) => handleLicenseFilterChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="all">All Users</option>
                <option value="yes">Has Licenses</option>
                <option value="no">No Licenses</option>
              </select>
            </div>

            {/* Expense Tracker Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense Tracker</label>
              <select
                value={expenseTrackerFilter}
                onChange={(e) => handleExpenseTrackerFilterChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="all">All Access</option>
                <option value="allowed">Enabled</option>
                <option value="restricted">Disabled</option>
              </select>
            </div>

            {/* CodePay Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CodePay</label>
              <select
                value={bkashTrackerFilter}
                onChange={(e) => handleBkashTrackerFilterChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="all">All Access</option>
                <option value="allowed">Enabled</option>
                <option value="restricted">Disabled</option>
              </select>
            </div>

            {/* Revenue Pro Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Pro</label>
              <select
                value={revenueProFilter}
                onChange={(e) => handleRevenueProFilterChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="all">All Access</option>
                <option value="allowed">Enabled</option>
                <option value="restricted">Disabled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm md:overflow-visible overflow-hidden">
        <div className={`overflow-x-auto md:overflow-visible transition-opacity duration-200 ${isPending ? "opacity-75 pointer-events-none" : ""}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="py-3.5 px-5">User Info</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5 text-center">Licenses</th>
                <th className="py-3.5 px-5">Active Features</th>
                <th className="py-3.5 px-5">Joined</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => {
                  const isCurrentUser = u.id === currentUserId;
                  const isUserAdmin = u.role === "admin" || u.role === "ADMIN";
                  const avatarColor = getAvatarGradient(u.name || u.email);
                  const initials = getInitials(u.name, u.email);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      {/* Name & Avatar */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                            {initials}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-extrabold text-slate-800 leading-tight">
                              {u.name || "User"}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">
                              {isUserAdmin ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black tracking-wide border border-emerald-100">
                                  ADMINISTRATOR
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold tracking-wide">
                                  STANDARD USER
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[9px] font-black tracking-wide border border-sky-100">
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-xs font-semibold text-slate-700">{u.email}</span>
                          {u.phone ? (
                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                              📞 {u.phone}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">No phone linked</span>
                          )}
                        </div>
                      </td>

                      {/* Licenses */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {u._count.licenses > 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-xs">
                            {u._count.licenses}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">—</span>
                        )}
                      </td>

                      {/* Features Active badges */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {u.downloadAllowed && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-750 text-[9px] font-black tracking-tight border border-orange-100 uppercase">
                              Downloads
                            </span>
                          )}
                          {u.expenseTrackerAllowed && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-750 text-[9px] font-black tracking-tight border border-emerald-100 uppercase">
                              Expense
                            </span>
                          )}
                          {u.bkashTrackerAllowed && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight border uppercase ${
                              u.codepayActive 
                                ? "bg-indigo-50 text-indigo-750 border-indigo-100" 
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              CodePay{u.codepayActive ? "" : " (Blocked)"}
                            </span>
                          )}
                          {u.revenueProAllowed && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-750 text-[9px] font-black tracking-tight border border-blue-100 uppercase">
                              Revenue Pro
                            </span>
                          )}
                          {!u.downloadAllowed && !u.expenseTrackerAllowed && !u.bkashTrackerAllowed && !u.revenueProAllowed && (
                            <span className="text-slate-300 text-xs italic font-medium">None active</span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-5 whitespace-nowrap text-xs text-slate-400 font-semibold">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Action 3-dot dropdown menu */}
                      <td className="py-4 px-5 text-right whitespace-nowrap relative">
                        <button
                          onClick={() => setActiveDropdownUserId(activeDropdownUserId === u.id ? null : u.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition outline-none border border-transparent cursor-pointer bg-transparent"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        
                        {activeDropdownUserId === u.id && (
                          <>
                            {/* Backdrop overlay to close when clicking outside */}
                            <div 
                              className="fixed inset-0 z-10 cursor-default bg-transparent" 
                              onClick={() => setActiveDropdownUserId(null)}
                            />
                            {/* Dropdown Card */}
                            <div className={`absolute right-5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-25 p-4 text-left animate-in fade-in duration-150 ${
                              paginatedUsers.indexOf(u) >= Math.max(0, paginatedUsers.length - 2)
                                ? "bottom-full mb-1.5 origin-bottom slide-in-from-bottom-2"
                                : "top-full mt-1.5 origin-top slide-in-from-top-2"
                            }`}>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Feature Access</h4>
                              
                              <div className="space-y-3.5">
                                {/* Downloads Access */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">Downloads</span>
                                    <span className="text-[9px] text-slate-400">Permit file downloads</span>
                                  </div>
                                  <ToggleSwitch 
                                    checked={u.downloadAllowed} 
                                    onChange={() => handleToggleDownloads(u.id, u.downloadAllowed)}
                                    disabled={isPending}
                                  />
                                </div>

                                {/* Expense Tracker */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">Expense Tracker</span>
                                    <span className="text-[9px] text-slate-400">Access expense features</span>
                                  </div>
                                  <ToggleSwitch 
                                    checked={u.expenseTrackerAllowed} 
                                    onChange={() => handleToggleExpenseTracker(u.id, u.expenseTrackerAllowed)}
                                    disabled={isPending}
                                  />
                                </div>

                                {/* CodePay */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">CodePay</span>
                                    <span className="text-[9px] text-slate-400">Access payment sync</span>
                                  </div>
                                  <ToggleSwitch 
                                    checked={u.bkashTrackerAllowed} 
                                    onChange={() => handleToggleBkashTracker(u.id, u.bkashTrackerAllowed)}
                                    disabled={isPending}
                                  />
                                </div>

                                {/* Revenue Pro */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">Revenue Pro</span>
                                    <span className="text-[9px] text-slate-400">Access Revenue Pro features</span>
                                  </div>
                                  <ToggleSwitch 
                                    checked={u.revenueProAllowed} 
                                    onChange={() => handleToggleRevenuePro(u.id, u.revenueProAllowed)}
                                    disabled={isPending}
                                  />
                                </div>

                                {/* CodePay API Status */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">CodePay API Status</span>
                                    <span className="text-[9px] text-slate-400">Enable/Block API requests</span>
                                  </div>
                                  <ToggleSwitch 
                                    checked={u.codepayActive} 
                                    onChange={() => handleToggleCodePayActive(u.id, u.codepayActive)}
                                    disabled={isPending}
                                  />
                                </div>
                              </div>

                              <div className="my-3 border-t border-slate-100" />

                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">System Access</h4>
                              
                              {isCurrentUser ? (
                                <div className="text-[10px] text-slate-400 italic text-center font-medium py-1">
                                  Cannot demote your own admin account
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleToggleRole(u.id, u.role);
                                    setActiveDropdownUserId(null);
                                  }}
                                  disabled={isPending}
                                  className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all border tracking-wider text-center cursor-pointer ${
                                    isUserAdmin
                                      ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                                      : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                                  }`}
                                >
                                  {isUserAdmin ? "DEMOTE FROM ADMIN" : "PROMOTE TO ADMIN"}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold bg-slate-50/50">
                    No users matching your search/filters were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 text-xs font-semibold text-slate-400">
          <div>
            Showing <span className="font-extrabold text-slate-700">{startIndex + 1}</span> to{" "}
            <span className="font-extrabold text-slate-700">{endIndex}</span> of{" "}
            <span className="font-extrabold text-slate-700">{totalItems}</span> users
          </div>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold transition text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl border font-black text-xs transition cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold transition text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
