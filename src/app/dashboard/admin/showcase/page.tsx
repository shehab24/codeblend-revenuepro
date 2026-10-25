import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShowcaseAdminClient } from "./client";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/dashboard/ui";

export default async function ShowcaseAdminPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const customers = await prisma.showcaseCustomer.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tools"
        title="Showcase customers"
        description="Manage the client logos shown on the CodeBlend website and client portal."
        icon={<BuildingStorefrontIcon className="h-6 w-6" />}
      />
      <ShowcaseAdminClient initialCustomers={customers} />
    </div>
  );
}
