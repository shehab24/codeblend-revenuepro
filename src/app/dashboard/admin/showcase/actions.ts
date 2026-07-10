"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { uploadToImageKit } from "@/lib/imagekit";

async function verifyAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== "admin" && user?.role !== "ADMIN") {
    throw new Error("Unauthorized access");
  }
}

export async function getShowcaseCustomers() {
  try {
    return await prisma.showcaseCustomer.findMany({
      orderBy: { order: "asc" }
    });
  } catch (error) {
    console.error("Error fetching showcase customers:", error);
    return [];
  }
}

export async function createShowcaseCustomer(data: {
  name: string;
  logoBase64?: string;
  logoFileName?: string;
  websiteUrl?: string;
  order?: number;
}) {
  await verifyAdmin();
  
  let logoUrl = "";
  if (data.logoBase64 && data.logoFileName) {
    try {
      logoUrl = await uploadToImageKit(data.logoBase64, data.logoFileName);
    } catch (err: any) {
      throw new Error(`Failed to upload logo to ImageKit: ${err.message || err}`);
    }
  } else {
    throw new Error("Logo image is required.");
  }
  
  const customer = await prisma.showcaseCustomer.create({
    data: {
      name: data.name,
      logoUrl,
      websiteUrl: data.websiteUrl || null,
      order: data.order || 0
    }
  });
  
  revalidatePath("/dashboard/admin/showcase");
  revalidatePath("/"); // revalidate front page
  return { success: true, customer };
}

export async function updateShowcaseCustomer(id: string, data: {
  name: string;
  logoBase64?: string;
  logoFileName?: string;
  websiteUrl?: string;
  order?: number;
}) {
  await verifyAdmin();
  
  const existing = await prisma.showcaseCustomer.findUnique({ where: { id } });
  if (!existing) throw new Error("Customer not found");
  
  let logoUrl = existing.logoUrl;
  if (data.logoBase64 && data.logoFileName) {
    try {
      logoUrl = await uploadToImageKit(data.logoBase64, data.logoFileName);
    } catch (err: any) {
      throw new Error(`Failed to upload logo to ImageKit: ${err.message || err}`);
    }
  }
  
  const customer = await prisma.showcaseCustomer.update({
    where: { id },
    data: {
      name: data.name,
      logoUrl,
      websiteUrl: data.websiteUrl || null,
      order: data.order !== undefined ? data.order : existing.order
    }
  });
  
  revalidatePath("/dashboard/admin/showcase");
  revalidatePath("/");
  return { success: true, customer };
}

export async function deleteShowcaseCustomer(id: string) {
  await verifyAdmin();
  
  await prisma.showcaseCustomer.delete({
    where: { id }
  });
  
  revalidatePath("/dashboard/admin/showcase");
  revalidatePath("/");
  return { success: true };
}
