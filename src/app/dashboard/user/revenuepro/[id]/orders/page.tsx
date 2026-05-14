import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrdersClient } from "@/components/OrdersClient";

export default async function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  const { id } = await params;
  
  if (!user) redirect("/sign-in");

  // Match the same auth pattern as the license details page
  const license = await prisma.license.findFirst({
    where: {
      id,
      OR: [
        { userId: user.id },
        { customerEmail: user.emailAddresses[0]?.emailAddress }
      ]
    },
    select: { id: true, domain: true, status: true }
  });

  // Allow admin access too
  if (!license) {
    const isAdmin = user.publicMetadata?.role === "admin";
    if (isAdmin) {
      const adminLicense = await prisma.license.findUnique({
        where: { id },
        select: { id: true, domain: true, status: true }
      });
      if (adminLicense) {
        return <OrdersClient licenseId={adminLicense.id} domain={adminLicense.domain} />;
      }
    }
    return notFound();
  }

  return <OrdersClient licenseId={license.id} domain={license.domain} />;
}
