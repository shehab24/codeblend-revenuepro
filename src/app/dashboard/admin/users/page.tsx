import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientUsersTable } from "./ClientUsersTable";

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
      <ClientUsersTable initialUsers={allUsers} currentUserId={user.id} />
    </div>
  );
}
