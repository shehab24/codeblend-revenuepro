import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { EditInvoiceForm } from "./EditInvoiceForm";

export default async function EditGuestInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) return notFound();

  return <EditInvoiceForm invoice={invoice} />;
}
