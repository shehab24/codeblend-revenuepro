import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CodePayCheckoutClient from "../CodePayCheckoutClient";

interface PageProps {
  params: Promise<{
    paymentId: string;
  }>;
}

export const metadata = {
  title: "CodePay Secure Checkout | CodeBlend",
};

export default async function CodePayCheckoutPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { paymentId } = resolvedParams;

  if (!paymentId) {
    return notFound();
  }

  // Load checkout session
  const payment = await prisma.codePayPayment.findUnique({
    where: { id: paymentId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          codepayBkash: true,
          codepayNagad: true,
          codepayRocket: true,
          codepayActive: true,
          codepayBrandName: true,
          codepayBrandLogo: true,
          codepayBrandColor: true,
        },
      },
    },
  });

  if (!payment) {
    return notFound();
  }

  // Sandbox payments always bypass the suspended check — they're for testing only, nothing real is saved.
  const isSandbox = payment.orderId.startsWith("SANDBOX_");

  // If user has been blocked/suspended by admin, reject REAL payment checkout screens only
  if (!payment.user.codepayActive && !isSandbox) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Merchant Gateway Suspended</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            This merchant&apos;s payment gateway account has been suspended by the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CodePayCheckoutClient
      payment={{
        id: payment.id,
        amount: payment.amount,
        orderId: payment.orderId,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        status: payment.status,
      }}
      merchant={{
        name: payment.user.name || payment.user.email.split("@")[0],
        bkash: payment.user.codepayBkash,
        nagad: payment.user.codepayNagad,
        rocket: payment.user.codepayRocket,
        brandName: payment.user.codepayBrandName || "",
        brandLogo: payment.user.codepayBrandLogo || "",
        brandColor: payment.user.codepayBrandColor || "#0f172a",
      }}
    />
  );
}
