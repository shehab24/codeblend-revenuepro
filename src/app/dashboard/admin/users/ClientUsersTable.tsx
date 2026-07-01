"use client";

import { useState, useTransition } from "react";
import { toggleUserRole, toggleUserDownloadAccess } from "./actions";

type UserWithLicensesCount = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  downloadAllowed: boolean;
  createdAt: Date | string;
  _count: {
    licenses: number;
  };
};

type Props = {
  initialUsers: UserWithLicensesCount[];
  currentUserId: string;
};

export function ClientUsersTable({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState<UserWithLicensesCount[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [downloadFilter, setDownloadFilter] = useState("all");
  const [licenseFilter, setLicenseFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isPending, startTransition] = useTransition();

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

    return searchMatch && roleMatch && downloadMatch && licenseMatch;
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
    
    // Optimistic UI update
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
        // Rollback on failure
        setUsers(initialUsers);
      }
    });
  };

  const handleToggleDownloads = async (userId: string, currentAllow: boolean) => {
    const newAllow = !currentAllow;

    // Optimistic UI update
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
        // Rollback on failure
        setUsers(initialUsers);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setDownloadFilter("all");
    setLicenseFilter("all");
    setCurrentPage(1);
  };

  const isFilterActive = searchQuery !== "" || roleFilter !== "all" || downloadFilter !== "all" || licenseFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search & Filters Controls */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          {/* Downloads Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Downloads:</span>
            <select
              value={downloadFilter}
              onChange={(e) => handleDownloadFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
            >
              <option value="all">All Access</option>
              <option value="allowed">Allowed Only</option>
              <option value="restricted">Restricted Only</option>
            </select>
          </div>

          {/* Licenses Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Licenses:</span>
            <select
              value={licenseFilter}
              onChange={(e) => handleLicenseFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
            >
              <option value="all">All Licenses</option>
              <option value="yes">Has Licenses</option>
              <option value="no">No Licenses</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-xs font-bold text-rose-500 hover:text-rose-700 transition flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className={`overflow-x-auto transition-opacity duration-200 ${isPending ? "opacity-75 pointer-events-none" : ""}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Licenses</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Downloads</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
              <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => {
                const isCurrentUser = u.id === currentUserId;
                const isUserAdmin = u.role === "admin" || u.role === "ADMIN";

                return (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="p-3 text-sm font-semibold text-slate-900">{u.name || "N/A"}</td>
                    <td className="p-3 text-sm text-slate-600">{u.email}</td>
                    <td className="p-3 text-sm font-mono text-slate-700">
                      {u.phone ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100">
                          📱 {u.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Set</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold tracking-wide ${
                          isUserAdmin ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isUserAdmin ? "ADMIN" : "USER"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-700 text-center font-bold">{u._count.licenses}</td>
                    <td className="p-3 text-sm">
                      <button
                        onClick={() => handleToggleDownloads(u.id, u.downloadAllowed)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border border-solid cursor-pointer outline-none ${
                          u.downloadAllowed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {u.downloadAllowed ? "✅ Allowed" : "🚫 Restricted"}
                      </button>
                    </td>
                    <td className="p-3 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">
                      {isCurrentUser ? (
                        <span className="text-xs text-slate-400 italic font-medium pl-2">You</span>
                      ) : (
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          disabled={isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all outline-none ${
                            isUserAdmin
                              ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          {isUserAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                  No users found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-slate-900">{endIndex}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalItems}</span> users
          </div>
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold transition text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                    className={`w-8 h-8 rounded-lg border font-semibold text-xs transition cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
              className={`px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold transition text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
