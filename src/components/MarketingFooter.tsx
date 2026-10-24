import Link from "next/link";
import { EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { BrandMark } from "./marketing/ui";
import { PILLAR_HREF, PILLAR_KEYS, PRODUCT_HREF, PRODUCT_KEYS, WHATSAPP_URL } from "./marketing/icons";
import { getI18n } from "@/lib/i18n/server";

export async function MarketingFooter() {
  const { t } = await getI18n();
  const c = t.common;

  const linkClass = "text-sm text-slate-400 transition-colors hover:text-white";

  return (
    <footer className="bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center gap-3">
              <BrandMark />
              <span>
                <span className="block text-lg font-semibold leading-tight tracking-tight">CodeBlend</span>
                <span className="block text-[11px] leading-tight text-slate-500">{c.brandTagline}</span>
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">{c.footer.about}</p>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{c.footer.services}</h4>
            <ul className="space-y-3">
              {PILLAR_KEYS.map((key) => (
                <li key={key}><Link href={PILLAR_HREF[key]} className={linkClass}>{c.serviceMenu[key].title}</Link></li>
              ))}
              <li><Link href="/services" className={linkClass}>{c.serviceMenu.all}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{c.footer.products}</h4>
            <ul className="space-y-3">
              {PRODUCT_KEYS.map((key) => (
                <li key={key}><Link href={PRODUCT_HREF[key]} className={linkClass}>{c.productMenu[key].title}</Link></li>
              ))}
              <li><Link href="/pricing" className={linkClass}>{c.nav.pricing}</Link></li>
              <li><Link href="/fraud-check" className={linkClass}>{c.nav.fraudCheck}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{c.footer.contact}</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@codeblend.co" className={`${linkClass} flex items-center gap-2`}>
                  <EnvelopeIcon className="h-4 w-4 text-emerald-400" />
                  info@codeblend.co
                </a>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-center gap-2`}>
                  <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp: 01570296656
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPinIcon className="h-4 w-4 text-emerald-400" />
                {c.footer.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} CodeBlend. {c.footer.rights}</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{c.footer.privacy}</a>
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{c.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
