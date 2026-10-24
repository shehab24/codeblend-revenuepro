import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import InteractiveImage from "@/components/InteractiveImage";
import { FeatureRow, ProductHero, ProductPricingSection } from "@/components/marketing/ProductSections";
import { BrowserFrame, Container, Section, SectionHeading } from "@/components/marketing/ui";
import { getI18n } from "@/lib/i18n/server";
import { CartImageTabs } from "./CartImageTabs";

export const metadata: Metadata = {
  title: "RevenuePro — WooCommerce Fraud Prevention & Order Automation | CodeBlend",
  description: "Courier-based fraud detection, OTP verification, partial payments, cart recovery and courier auto-booking for WooCommerce.",
};

function Shot({ src, alt, width, height, className = "max-w-lg" }: { src: string; alt: string; width: number; height: number; className?: string }) {
  return (
    <div className={`w-full overflow-hidden rounded-xl shadow-[0_24px_60px_-20px_rgb(15_23_42/0.3)] ring-1 ring-slate-200 ${className}`}>
      <InteractiveImage src={src} alt={alt} width={width} height={height} className="h-auto w-full object-contain" />
    </div>
  );
}

export default async function RevenueProPage() {
  const { userId } = await auth();
  const { locale, t } = await getI18n();
  const r = t.revenuepro;
  const [bkash, partial, otp, fraud, cart, sms, courier, tracking, quick] = r.sections;

  // Media for each feature section, in the same order as r.sections.
  const media: React.ReactNode[] = [
    <Shot key="bkash" src="/feature-bkash.png" alt="bKash payment settings" width={865} height={481} />,
    <Shot key="partial" src="/feature-partial.png" alt="Partial payment settings" width={865} height={275} />,
    <div key="otp" className="mx-auto flex w-full max-w-lg items-center gap-4">
      {[
        { src: "/otp-step-1.png", label: otp.steps?.[0] },
        { src: "/otp-step-2.png", label: otp.steps?.[1] },
      ].map((s, i) => (
        <div key={s.src} className="flex flex-1 items-center gap-4">
          {i === 1 && <span className="shrink-0 text-2xl font-bold text-slate-300">→</span>}
          <div className="flex-1 text-center">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
            <InteractiveImage src={s.src} alt={s.label ?? "OTP"} width={440} height={520} className="h-auto w-full object-contain" />
          </div>
        </div>
      ))}
    </div>,
    <div key="fraud" className="relative mx-auto flex min-h-[380px] w-full max-w-lg items-center">
      <div className="w-5/6 overflow-hidden rounded-2xl shadow-md">
        <InteractiveImage src="/feature-fraud.png" alt="Fraud detection rules" width={865} height={539} className="h-auto w-full object-contain" />
      </div>
      <div className="absolute bottom-4 right-0 w-5/12 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <InteractiveImage src="/fraud-popup.png" alt="Blocked order warning on checkout" width={440} height={520} className="h-auto w-full object-contain" />
      </div>
    </div>,
    <CartImageTabs key="cart" labels={cart.tabs ?? ["Settings", "Logs"]} />,
    <Shot key="sms" src="/feature-sms.png" alt="SMS notification settings" width={864} height={539} />,
    <Shot key="courier" src="/feature-courier.png" alt="Courier automation settings" width={865} height={539} />,
    <Shot key="tracking" src="/feature-tracking.png" alt="Meta Pixel, Conversions API and UTM settings" width={865} height={539} />,
    <div key="quick" className="relative mx-auto flex min-h-[380px] w-full max-w-lg items-center">
      <div className="w-10/12 overflow-hidden rounded-2xl shadow-md">
        <InteractiveImage src="/feature-general-ux.png" alt="Checkout field settings" width={907} height={570} className="h-auto w-full object-contain" />
      </div>
      <div className="absolute -top-6 right-2 w-[170px] overflow-hidden rounded-3xl border-4 border-slate-800 bg-white shadow-2xl">
        <InteractiveImage src="/feature-quick-order.png" alt="Quick order popup form" width={260} height={510} className="h-auto w-full object-contain" />
      </div>
    </div>,
  ];

  const orderMock = (
        <BrowserFrame url="yourstore.com/wp-admin/post.php?post=1042">
        <div className="p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{r.mock.panel}</span>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">{r.mock.title}</p>
            </div>
            <span className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{r.mock.pending}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{r.mock.customer}</span>
                <span className="block text-sm font-bold text-slate-800">Shehab Uddin</span>
                <span className="mt-1 block text-xs text-slate-500">{r.mock.phone}: 01712345678</span>
                <span className="mt-0.5 block text-xs text-slate-500">{r.mock.location}: Dhaka, BD</span>
              </div>
              <span className="mt-4 block text-[10px] text-slate-400">IP: 103.45.10.12</span>
            </div>
            <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{r.mock.stats}</span>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-rose-500/20 border-t-rose-500 text-sm font-black text-rose-600">
                  29%
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800">{r.mock.riskTitle}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{r.mock.riskDesc}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px]">
                <span className="flex items-center gap-1 font-bold text-rose-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {r.mock.warning}
                </span>
                <span className="font-medium text-slate-400">{r.mock.verify}</span>
              </div>
            </div>
          </div>
        </div>
        </BrowserFrame>
  );

  return (
    <div className="overflow-x-hidden bg-white">
      <ProductHero
        product="revenuepro"
        {...r.hero}
        dashboardLabel={t.common.cta.openDashboard}
        isLoggedIn={!!userId}
        leadService="RevenuePro"
        visual={orderMock}
      />

      <Container className="space-y-28 py-16 md:space-y-36 md:py-24">
        {[bkash, partial, otp, fraud, cart, sms, courier, tracking, quick].map((s, i) => (
          <FeatureRow key={s.title} tag={s.tag} title={s.title} desc={s.desc} points={s.points} tone="emerald" reverse={i % 2 === 1}>
            {media[i]}
          </FeatureRow>
        ))}
      </Container>

      <Section dark>
        <Container>
          <SectionHeading dark title={r.featureList.title} subtitle={r.featureList.subtitle} />
          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2">
            {r.featureList.items.map((item) => (
              <div key={item} className="flex items-center gap-3 bg-slate-950 px-6 py-5">
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <ProductPricingSection
        product="revenuepro"
        title={r.pricing.title}
        subtitle={r.pricing.subtitle}
        t={t.pricing}
        locale={locale}
        isLoggedIn={!!userId}
      />
    </div>
  );
}
