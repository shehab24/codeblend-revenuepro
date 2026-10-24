import { Anek_Bangla, Noto_Sans_Bengali } from "next/font/google";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";
import { LocaleProvider } from "@/components/marketing/LocaleProvider";
import { getI18n } from "@/lib/i18n/server";

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
});

// Display face for Bangla headings: heavier and more compact than Noto at the same size.
const anekBangla = Anek_Bangla({
  variable: "--font-bangla-display",
  subsets: ["bengali"],
});

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, t } = await getI18n();

  return (
    <LocaleProvider locale={locale} common={t.common}>
      <div
        lang={locale}
        className={`${notoBengali.variable} ${anekBangla.variable} min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden`}
        // Geist covers Latin; Bengali glyphs fall back to Noto Sans Bengali.
        style={{ fontFamily: "var(--font-geist-sans), var(--font-bangla), ui-sans-serif, system-ui, sans-serif" }}
      >
        <MarketingNavbar />
        <main className="overflow-x-hidden">{children}</main>
        <MarketingFooter />
      </div>
    </LocaleProvider>
  );
}
