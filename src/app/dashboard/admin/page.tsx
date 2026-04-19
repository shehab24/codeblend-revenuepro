import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const licensesCount = await prisma.license.count();
  const usersCount = await prisma.user.count();
  const recentLogs = await prisma.verificationLog.findMany({
    take: 5,
    orderBy: { timestamp: "desc" },
    include: { license: true }
  });

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Total Users</div>
          <div className="text-3xl font-extrabold text-slate-900">{usersCount}</div>
          <div className="text-xs text-slate-400 mt-1">Synced via Clerk</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Total Licenses</div>
          <div className="text-3xl font-extrabold text-emerald-600">{licensesCount}</div>
          <div className="text-xs text-slate-400 mt-1">Active API keys</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Activity</div>
          <div className="text-3xl font-extrabold text-slate-900">{recentLogs.length}</div>
          <div className="text-xs text-slate-400 mt-1">Last 5 verifications</div>
        </div>
      </div>

      {/* Recent Verifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Recent API Verifications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-3 text-xs font-medium text-slate-400 uppercase">Time</th>
                <th className="p-3 text-xs font-medium text-slate-400 uppercase">Domain</th>
                <th className="p-3 text-xs font-medium text-slate-400 uppercase">IP</th>
                <th className="p-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-3 text-sm text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 text-sm text-slate-600 font-medium">{log.license.domain}</td>
                  <td className="p-3 text-sm text-slate-500">{log.ipAddress || "N/A"}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      log.status === "success"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No verifications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
