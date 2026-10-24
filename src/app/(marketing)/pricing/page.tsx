import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { PricingSectionWithTabs } from "@/components/PricingSectionWithTabs";
import { LogoCloud } from "@/components/marketing/Blocks";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.pricing.meta.title, description: t.pricing.meta.description };
}

export default async function PricingPage() {
  const { userId } = await auth();
  const { locale, t } = await getI18n();

  return (
    <div className="min-h-screen bg-white">
      <PricingSectionWithTabs t={t.pricing} locale={locale} isLoggedIn={!!userId} as="h1" />
      <div className="pb-12">
        <LogoCloud label={t.home.logos} />
      </div>
    </div>
  );
}
