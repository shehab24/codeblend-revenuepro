import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./client";

export default async function UserProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      licenses: {
        select: { id: true, domain: true, status: true, tier: true, paymentStatus: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      },
      transactions: {
        select: { id: true, amount: true, status: true, paymentMethod: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5
      },
      serviceRequests: {
        select: { id: true, serviceType: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!dbUser) redirect("/dashboard/user");

  const totalPaid = dbUser.transactions
    .filter(t => t.status === "verified" || t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const activeLicenses = dbUser.licenses.filter(l => l.status === "active").length;
  const pendingLicenses = dbUser.licenses.filter(l => l.status === "pending").length;

  const profileData = {
    name: user.fullName || dbUser.name || "User",
    email: dbUser.email,
    phone: dbUser.phone || user.phoneNumbers?.[0]?.phoneNumber || null,
    imageUrl: user.imageUrl || null,
    createdAt: dbUser.createdAt.toISOString(),
    clerkId: user.id,
    role: dbUser.role,
    verified: dbUser.verified,
    totalLicenses: dbUser.licenses.length,
    activeLicenses,
    pendingLicenses,
    totalTransactions: dbUser.transactions.length,
    totalPaid,
    totalRequests: dbUser.serviceRequests.length,
    recentLicenses: dbUser.licenses.slice(0, 5).map(l => ({
      ...l,
      createdAt: l.createdAt.toISOString()
    })),
    recentTransactions: dbUser.transactions.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString()
    })),
  };

  return <ProfileClient profile={profileData} />;
}
