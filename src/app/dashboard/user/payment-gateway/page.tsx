import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentGatewayClient from "./PaymentGatewayClient";

export const metadata = {
  title: "Payment Gateway - bKash SMS Tracker | CodeBlend",
};

export default async function PaymentGatewayPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Check if bkashTrackerAllowed is true
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { bkashTrackerAllowed: true },
  });

  if (!dbUser?.bkashTrackerAllowed) {
    redirect("/dashboard/user");
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
      />
    </div>
  );
}
