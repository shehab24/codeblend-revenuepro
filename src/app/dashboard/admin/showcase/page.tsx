import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShowcaseAdminClient } from "./client";

export default async function ShowcaseAdminPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const customers = await prisma.showcaseCustomer.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Showcase Customers</h1>
        <p className="text-sm text-slate-500 mt-1">Manage the clients and companies displayed on the CodeBlend front page.</p>
      </div>
      <ShowcaseAdminClient initialCustomers={customers} />
    </div>
  );
}
