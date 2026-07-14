import { Suspense } from "react";
import { PayClient } from "./PayClient";

export const metadata = {
  title: "Secure CodePay Payment Checkout | CodeBlend",
  description: "Complete your manual payment securely using our automated SMS verification system.",
};

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-sm font-semibold text-slate-400">Loading Checkout...</p>
        </div>
      </div>
    }>
      <PayClient />
    </Suspense>
  );
}
