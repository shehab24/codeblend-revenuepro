import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import { DASH_BTN, PageHeader, Panel } from "@/components/dashboard/ui";
import { ClientInvoicesTable } from "./ClientInvoicesTable";

export default async function AdminInvoicesPage() {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  // Fetch all guest invoices and quotations
  const invoices = await prisma.invoice.findMany({
    where: {
      type: {
        in: ["guest_invoice", "guest_quotation"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Guest billing & quotations"
        description="Build and manage invoices and quotations for clients without an account."
        icon={<DocumentTextIcon className="h-6 w-6" />}
        actions={
          <Link href="/dashboard/admin/invoices/create" className={DASH_BTN.primary}>
            <PlusIcon className="h-4 w-4" /> Build document
          </Link>
        }
      />

      <Panel title="Documents" description={`${invoices.length} invoices and quotations`}>
        <ClientInvoicesTable initialInvoices={invoices} />
      </Panel>
    </div>
  );
}
