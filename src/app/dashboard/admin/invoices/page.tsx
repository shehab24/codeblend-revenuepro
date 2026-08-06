import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Guest Billing & Quotations</h3>
          <p className="text-sm text-slate-500 mt-1">
            Build and manage invoices and quotations for non-registered users.
          </p>
        </div>
        <Link
          href="/dashboard/admin/invoices/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer no-underline shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Build Document
        </Link>
      </div>

      <ClientInvoicesTable initialInvoices={invoices} />
    </div>
  );
}
