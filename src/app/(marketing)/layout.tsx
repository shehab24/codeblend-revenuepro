import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-[var(--font-geist-sans)] overflow-x-hidden">
      <MarketingNavbar />
      <main className="overflow-x-hidden">{children}</main>
      <MarketingFooter />
    </div>
  );
}
