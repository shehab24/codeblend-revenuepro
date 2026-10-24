import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ChevronDownIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { MobileMenu } from "./MobileMenu";
import { LocaleSwitcher } from "./marketing/LocaleSwitcher";
import { BTN, BrandMark, IconBadge, PILLAR_TONE, PRODUCT_TONE } from "./marketing/ui";
import { PILLAR_HREF, PILLAR_ICONS, PILLAR_KEYS, PRODUCT_HREF, PRODUCT_ICONS, PRODUCT_KEYS } from "./marketing/icons";
import { getI18n } from "@/lib/i18n/server";

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group py-2">
      <button className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 group-focus-within:text-slate-900 cursor-pointer">
        {label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:rotate-180" strokeWidth={2.5} />
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">{children}</div>
      </div>
    </div>
  );
}

function DropdownItem({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50">
      {icon}
      <span>
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
      </span>
    </Link>
  );
}

export async function MarketingNavbar() {
  const { userId } = await auth();
  const { t } = await getI18n();
  const c = t.common;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
          <span>
            <span className="block text-lg font-semibold leading-tight tracking-tight text-slate-950">CodeBlend</span>
            <span className="block text-[11px] leading-tight text-slate-400">{c.brandTagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Dropdown label={c.nav.services}>
            {PILLAR_KEYS.map((key) => {
              const Icon = PILLAR_ICONS[key];
              return (
                <DropdownItem
                  key={key}
                  href={PILLAR_HREF[key]}
                  title={c.serviceMenu[key].title}
                  desc={c.serviceMenu[key].desc}
                  icon={<IconBadge tone={PILLAR_TONE[key]} size="sm"><Icon className="h-4 w-4" /></IconBadge>}
                />
              );
            })}
            <Link href="/services" className="mt-1 flex items-center justify-between rounded-xl border-t border-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
              {c.serviceMenu.all}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </Dropdown>

          <Dropdown label={c.nav.products}>
            {PRODUCT_KEYS.map((key) => {
              const Icon = PRODUCT_ICONS[key];
              return (
                <DropdownItem
                  key={key}
                  href={PRODUCT_HREF[key]}
                  title={c.productMenu[key].title}
                  desc={c.productMenu[key].desc}
                  icon={<IconBadge tone={PRODUCT_TONE[key]} size="sm"><Icon className="h-4 w-4" /></IconBadge>}
                />
              );
            })}
            <Link href="/features" className="mt-1 flex items-center justify-between rounded-xl border-t border-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
              {c.nav.features}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </Dropdown>

          <Link href="/pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            {c.nav.pricing}
          </Link>
          <Link href="/fraud-check" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            {c.nav.fraudCheck}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher />
          <Link
            href={userId ? "/dashboard" : "/sign-in"}
            className={`${BTN.primary} !px-5 !py-2.5`}
          >
            {userId ? c.nav.dashboard : c.nav.getStarted}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <MobileMenu isLoggedIn={!!userId} />
      </div>
    </header>
  );
}
