"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createLicense(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const domain = formData.get("domain") as string;
  if (!domain) throw new Error("Domain is required");

  // Generate a realistic license key format
  const key = "REVPRO-" + crypto.randomBytes(12).toString("hex").toUpperCase();

  await prisma.license.create({
    data: {
      userId,
      domain,
      key,
    }
  });

  revalidatePath("/dashboard/user");
  return { success: true };
}

export async function deleteLicense(licenseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.license.delete({
    where: {
      id: licenseId,
      userId,
    }
  });

  revalidatePath("/dashboard/user");
  return { success: true };
}
