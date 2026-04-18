import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      fallbackRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-2xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 p-2",
          headerTitle: "text-slate-900 font-bold",
          formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 rounded-xl",
          footerActionLink: "text-emerald-600 hover:text-emerald-700",
        },
      }}
    />
  );
}
