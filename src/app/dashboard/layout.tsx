import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  const isAdmin = user.publicMetadata?.role === "admin";
  const userEmail = user.emailAddresses[0]?.emailAddress || "unknown@domain.com";

  let dbUser = null;
  try {
    dbUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: userEmail,
        name: user.fullName || "User",
        role: isAdmin ? "ADMIN" : "USER",
      },
      update: {
        email: userEmail,
        name: user.fullName || "User",
        role: isAdmin ? "ADMIN" : "USER",
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      dbUser = await prisma.user.update({
        where: { email: userEmail },
        data: {
          id: user.id,
          name: user.fullName || "User",
          role: isAdmin ? "ADMIN" : "USER",
        }
      });
    } else {
      throw error;
    }
  }

  console.log("DB USER IN LAYOUT:", {
    email: dbUser?.email,
    expenseTrackerAllowed: dbUser?.expenseTrackerAllowed,
    downloadAllowed: dbUser?.downloadAllowed
  });

  const hasPhone = !!dbUser?.phone;

  return (
    <DashboardShell
      isAdmin={!!isAdmin}
      userName={user.fullName || "User"}
      userEmail={userEmail}
      userImageUrl={user.imageUrl}
      hasPhone={hasPhone}
      expenseTrackerAllowed={!!dbUser?.expenseTrackerAllowed}
      bkashTrackerAllowed={!!dbUser?.bkashTrackerAllowed}
      revenueProAllowed={dbUser?.revenueProAllowed ?? true}
    >
      {children}
    </DashboardShell>
  );
}
