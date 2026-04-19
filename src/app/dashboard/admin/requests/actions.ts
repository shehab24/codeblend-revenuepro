"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function adminUpdateServiceRequest(formData: FormData) {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string) || 0;
  const paidAmount = parseFloat(formData.get("paidAmount") as string) || 0;
  const deliveryDateString = formData.get("deliveryDate") as string;

  const deliveryDate = deliveryDateString ? new Date(deliveryDateString) : null;

  await prisma.serviceRequest.update({
    where: { id },
    data: {
      status,
      totalAmount,
      paidAmount,
      deliveryDate,
    },
  });

  revalidatePath("/dashboard/admin/requests");
  revalidatePath("/dashboard/user/requests");
}
