import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toggleUserRole } from "./actions";

export default async function AdminUsersPage() {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { licenses: true }
      }
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="mb-4 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">System Users</h3>
        <p className="text-sm text-slate-400 mt-1">
          Users are automatically synced when they visit the dashboard.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="p-3 text-xs font-medium text-slate-400 uppercase">Name</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase">Email</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase">Role</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase">Licenses</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase">Joined</th>
              <th className="p-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length > 0 ? allUsers.map((u) => {
              const isCurrentUser = u.id === user.id;
              const isUserAdmin = u.role === "admin" || u.role === "ADMIN";

              return (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-3 text-sm font-medium text-slate-900">{u.name || "N/A"}</td>
                  <td className="p-3 text-sm text-slate-600">{u.email}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isUserAdmin
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {isUserAdmin ? "ADMIN" : "USER"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-600">{u._count.licenses}</td>
                  <td className="p-3 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-sm">
                    {isCurrentUser ? (
                      <span className="text-xs text-slate-400 italic">You</span>
                    ) : (
                      <form action={toggleUserRole}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="newRole" value={isUserAdmin ? "USER" : "ADMIN"} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all ${
                            isUserAdmin
                              ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          {isUserAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">No users synced yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
