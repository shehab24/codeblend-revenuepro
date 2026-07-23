"use server";

import { prisma } from "@/lib/prisma";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleUserRole(formData: FormData) {
  // 1. Verify the caller is an admin
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can change roles.");
  }

  const targetUserId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as string; // "ADMIN" or "USER"

  if (!targetUserId || !newRole) throw new Error("Missing required fields.");

  // 2. Update in local DB
  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  // 3. Update Clerk publicMetadata so the role is recognized on next login
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: newRole === "ADMIN" ? "admin" : "user",
      },
    });
  } catch (err) {
    console.error("Warning: Failed to update user metadata in Clerk (user may not exist in Clerk):", err);
  }

  revalidatePath("/dashboard/admin/users");
}

export async function toggleUserDownloadAccess(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage download access.");
  }

  const targetUserId = formData.get("userId") as string;
  const allow = formData.get("allow") === "true";

  if (!targetUserId) throw new Error("Missing user ID.");

  await prisma.user.update({
    where: { id: targetUserId },
    data: { downloadAllowed: allow },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function toggleUserExpenseTrackerAccess(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage expense tracker access.");
  }

  const targetUserId = formData.get("userId") as string;
  const allow = formData.get("allow") === "true";

  if (!targetUserId) throw new Error("Missing user ID.");

  await prisma.user.update({
    where: { id: targetUserId },
    data: { expenseTrackerAllowed: allow },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function toggleUserBkashTrackerAccess(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage bkash tracker access.");
  }

  const targetUserId = formData.get("userId") as string;
  const allow = formData.get("allow") === "true";

  if (!targetUserId) throw new Error("Missing user ID.");

  await prisma.user.update({
    where: { id: targetUserId },
    data: { bkashTrackerAllowed: allow },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function toggleUserRevenueProAccess(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage revenue pro access.");
  }

  const targetUserId = formData.get("userId") as string;
  const allow = formData.get("allow") === "true";

  if (!targetUserId) throw new Error("Missing user ID.");

  await prisma.user.update({
    where: { id: targetUserId },
    data: { revenueProAllowed: allow },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function toggleUserCodePayActive(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage CodePay API status.");
  }

  const targetUserId = formData.get("userId") as string;
  const active = formData.get("active") === "true";

  if (!targetUserId) throw new Error("Missing user ID.");

  await prisma.user.update({
    where: { id: targetUserId },
    data: { codepayActive: active },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function toggleLicensePaymentStatusFromAdmin(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage license payments.");
  }

  const licenseId = formData.get("licenseId") as string;
  const paymentStatus = formData.get("paymentStatus") as string; // "paid" or "unpaid"
  const targetUserId = formData.get("targetUserId") as string;

  if (!licenseId || !paymentStatus) throw new Error("Missing required fields.");

  await prisma.license.update({
    where: { id: licenseId },
    data: { paymentStatus },
  });

  if (targetUserId) {
    revalidatePath(`/dashboard/admin/users/${targetUserId}`);
  }
  revalidatePath("/dashboard/admin/licenses");
}

export async function updateServiceRequestBillingFromAdmin(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage service request billing.");
  }

  const serviceRequestId = formData.get("serviceRequestId") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string) || 0;
  const paidAmount = parseFloat(formData.get("paidAmount") as string) || 0;
  const status = (formData.get("status") as string) || "pending";
  const targetUserId = formData.get("targetUserId") as string;

  if (!serviceRequestId) throw new Error("Missing service request ID.");

  await prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      totalAmount,
      paidAmount,
      status,
    },
  });

  if (targetUserId) {
    revalidatePath(`/dashboard/admin/users/${targetUserId}`);
  }
  revalidatePath("/dashboard/admin/requests");
}

export async function deleteServiceRequestFromAdmin(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can delete service requests.");
  }

  const serviceRequestId = formData.get("serviceRequestId") as string;
  const targetUserId = formData.get("targetUserId") as string;

  if (!serviceRequestId) throw new Error("Missing service request ID.");

  await prisma.serviceRequest.delete({
    where: { id: serviceRequestId },
  });

  if (targetUserId) {
    revalidatePath(`/dashboard/admin/users/${targetUserId}`);
  }
  revalidatePath("/dashboard/admin/requests");
}

export async function deleteLicenseFromAdmin(formData: FormData) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: callerId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can delete server licenses.");
  }

  const licenseId = formData.get("licenseId") as string;
  const targetUserId = formData.get("targetUserId") as string;

  if (!licenseId) throw new Error("Missing license ID.");

  await prisma.license.delete({
    where: { id: licenseId },
  });

  if (targetUserId) {
    revalidatePath(`/dashboard/admin/users/${targetUserId}`);
  }
  revalidatePath("/dashboard/admin/licenses");
}
