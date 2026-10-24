import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { FeatureRow, ProductHero, ProductPricingSection } from "@/components/marketing/ProductSections";
import { Container, Section, SectionHeading } from "@/components/marketing/ui";
import { getI18n } from "@/lib/i18n/server";
import { BrandCustomizer } from "./BrandCustomizer";

export const metadata: Metadata = {
  title: "CodePay — 0% Commission MFS Payment Gateway | CodeBlend",
  description: "Accept bKash, Nagad, Rocket, Upay and bank transfers directly to your own wallet with automatic TrxID verification.",
};

// Screenshot + optional brand colour for each section in t.codepay.sections.
const SHOTS = [
  { src: "/codepay-options.png", width: 453, height: 459, max: "max-w-xs" },
  { src: "/codepay-bkash.png", width: 406, height: 487, max: "max-w-xs", color: "#e2125a" },
  { src: "/codepay-nagad.png", width: 331, height: 582, max: "max-w-[240px]", color: "#f35923" },
  { src: "/codepay-rocket.png", width: 485, height: 583, max: "max-w-xs", color: "#8c3494" },
  { src: "/codepay-upay.png", width: 485, height: 531, max: "max-w-xs", color: "#b38f00" },
];

export default async function CodePayPage() {
  const { userId } = await auth();
  const { locale, t } = await getI18n();
  const cp = t.codepay;

  return (
    <div className="overflow-x-hidden bg-white">
      <ProductHero
        product="codepay"
        badge={cp.hero.badge}
        title={cp.hero.title}
        highlight={cp.hero.highlight}
        subtitle={cp.hero.subtitle}
        primary={cp.hero.primary}
        dashboardLabel={cp.hero.dashboard}
        secondary={cp.hero.secondary}
        isLoggedIn={!!userId}
        leadService="CodePay"
        visual={
          <div className="mx-auto w-full max-w-[22rem] rounded-[2.5rem] bg-slate-950 p-3 shadow-[0_30px_80px_-30px_rgb(15_23_42/0.6)] ring-1 ring-slate-800">
            <div className="overflow-hidden rounded-[2rem] bg-white">
              <Image src="/codepay-options.png" alt="CodePay checkout" width={453} height={459} className="h-auto w-full" priority />
            </div>
          </div>
        }
      />

      <Section muted>
        <Container>
          <SectionHeading title={cp.customizer.title} subtitle={cp.customizer.subtitle} tone="teal" />
          <BrandCustomizer t={cp.customizer} />
        </Container>
      </Section>

      <Container className="space-y-28 py-24 md:space-y-36 md:py-32">
        {cp.sections.map((s, i) => {
          const shot = SHOTS[i];
          return (
            <FeatureRow key={s.title} tag={s.tag} title={s.title} desc={s.desc} points={s.points} tone="teal" tagColor={shot.color} reverse={i % 2 === 1}>
              <div className={`w-full ${shot.max} overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgb(15_23_42/0.3)] ring-1 ring-slate-200`}>
                <Image src={shot.src} alt={s.title} width={shot.width} height={shot.height} className="h-auto w-full object-contain" />
              </div>
            </FeatureRow>
          );
        })}
      </Container>

      <ProductPricingSection
        product="codepay"
        title={cp.pricing.title}
        subtitle={cp.pricing.subtitle}
        t={t.pricing}
        locale={locale}
        isLoggedIn={!!userId}
      />
    </div>
  );
}
