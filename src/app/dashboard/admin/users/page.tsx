import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShieldCheckIcon, UserPlusIcon, UsersIcon, KeyIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
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

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newUsers = allUsers.filter((u) => u.createdAt.getTime() >= thirtyDaysAgo).length;
  const admins = allUsers.filter((u) => u.role.toLowerCase() === "admin").length;
  const withLicenses = allUsers.filter((u) => u._count.licenses > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="System users"
        description="Everyone who has signed in to CodeBlend. Users sync automatically when they open the dashboard."
        icon={<UsersIcon className="h-6 w-6" />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total users" value={allUsers.length} icon={<UsersIcon className="h-5 w-5" />} tone="sky" />
        <StatCard label="New in 30 days" value={newUsers} icon={<UserPlusIcon className="h-5 w-5" />} tone="emerald" />
        <StatCard label="With licenses" value={withLicenses} icon={<KeyIcon className="h-5 w-5" />} tone="violet" />
        <StatCard label="Admins" value={admins} icon={<ShieldCheckIcon className="h-5 w-5" />} tone="slate" />
      </div>

      <Panel title="All users" description="Search, filter and manage access for each account">
        <ClientUsersTable initialUsers={allUsers} currentUserId={user.id} />
      </Panel>
    </div>
  );
}
