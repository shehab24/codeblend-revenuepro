import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/dashboard/ui";
import { ClientSearch } from "./ClientSearch";

export default async function AdminSearchPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tools"
        title="Live number look-up"
        description="Check a customer's courier delivery history in real time."
        icon={<MagnifyingGlassIcon className="h-6 w-6" />}
      />
      <ClientSearch />
    </div>
  );
}
