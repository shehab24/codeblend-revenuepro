import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentGatewayClient from "./PaymentGatewayClient";
import { AccessRestricted } from "@/components/AccessRestricted";

export const metadata = {
  title: "CodePay - SMS Tracker | CodeBlend",
};

export default async function PaymentGatewayPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Auto-cleanup old sandbox payments (older than 3 days)
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await prisma.codePayPayment.deleteMany({
      where: {
        userId,
        orderId: { startsWith: "SANDBOX_" },
        createdAt: { lt: threeDaysAgo },
      },
    });
  } catch (err) {
    console.error("Failed to auto-cleanup old sandbox payments:", err);
  }

  // Auto-cleanup old synced MFS transactions (older than 7 days)
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.bkashSmsTransaction.deleteMany({
      where: {
        userId,
        createdAt: { lt: sevenDaysAgo },
      },
    });
  } catch (err) {
    console.error("Failed to auto-cleanup old MFS transactions:", err);
  }

  // Check if bkashTrackerAllowed is true and fetch CodePay credentials
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bkashTrackerAllowed: true,
      codepayApiKey: true,
      codepayApiSecret: true,
      codepayBkash: true,
      codepayNagad: true,
      codepayRocket: true,
      codepayActive: true,
      codepayBrandName: true,
      codepayBrandLogo: true,
      codepayBrandColor: true,
    },
  });

  if (!dbUser?.bkashTrackerAllowed) {
    return <AccessRestricted featureName="CodePay" />;
  }

  // Fetch initial transactions
  const transactions = await prisma.bkashSmsTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics
  const totalCount = transactions.length;
  const unusedCount = transactions.filter((t) => t.status === "unused").length;
  const usedCount = transactions.filter((t) => t.status === "used").length;
  const totalAmount = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Serialize dates for client side
  const serializedTransactions = transactions.map((t) => ({
    id: t.id,
    trxId: t.trxId,
    sender: t.sender,
    amount: t.amount,
    rawMessage: t.rawMessage,
    senderAddress: t.senderAddress || "bKash",
    status: t.status,
    orderId: t.orderId || null,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PaymentGatewayClient
        initialTransactions={serializedTransactions}
        stats={{
          totalCount,
          unusedCount,
          usedCount,
          totalAmount,
        }}
        gatewaySettings={{
          apiKey: dbUser.codepayApiKey || null,
          apiSecret: dbUser.codepayApiSecret || null,
          bkash: dbUser.codepayBkash || "",
          nagad: dbUser.codepayNagad || "",
          rocket: dbUser.codepayRocket || "",
          active: dbUser.codepayActive,
          brandName: dbUser.codepayBrandName || "",
          brandLogo: dbUser.codepayBrandLogo || "",
          brandColor: dbUser.codepayBrandColor || "#0f172a",
        }}
      />
    </div>
  );
}
