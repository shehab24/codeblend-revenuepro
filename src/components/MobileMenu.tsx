"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useLocale } from "./marketing/LocaleProvider";
import { LocaleSwitcher } from "./marketing/LocaleSwitcher";
import { BrandMark, IconBadge, PILLAR_TONE, PRODUCT_TONE } from "./marketing/ui";
import { PILLAR_HREF, PILLAR_ICONS, PILLAR_KEYS, PRODUCT_HREF, PRODUCT_ICONS, PRODUCT_KEYS } from "./marketing/icons";

type Section = "services" | "products" | null;

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { common: c } = useLocale();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>(null);
  const [mounted, setMounted] = useState(false);

  // Wait for client mount so createPortal works
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSection(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset submenu state on close
  const close = () => {
    setOpen(false);
    setSection(null);
  };
  const toggle = (s: Section) => setSection((cur) => (cur === s ? null : s));

  const groupButton = (s: Exclude<Section, null>, label: string) => (
    <button
      onClick={() => toggle(s)}
      aria-expanded={section === s}
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition-colors cursor-pointer ${
        section === s ? "bg-slate-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
      <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${section === s ? "rotate-180" : ""}`} strokeWidth={2.5} />
    </button>
  );

  const drawer = (
    <>
      {/* Backdrop — rendered directly in body via portal, so z-index is always correct */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-[9999] flex h-full w-80 max-w-[88vw] flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
          open ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link href="/" onClick={close} className="flex items-center gap-2.5">
            <BrandMark size={36} />
            <span>
              <span className="block text-base font-bold leading-tight text-slate-900">CodeBlend</span>
              <span className="block text-[11px] leading-tight text-slate-400">{c.brandTagline}</span>
            </span>
          </Link>
          <button
            onClick={close}
            aria-label={c.nav.closeMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {groupButton("services", c.nav.services)}
          {section === "services" && (
            <div className="mb-2 space-y-1 px-2 pt-1">
              {PILLAR_KEYS.map((key) => {
                const Icon = PILLAR_ICONS[key];
                return (
                  <Link key={key} href={PILLAR_HREF[key]} onClick={close} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50">
                    <IconBadge tone={PILLAR_TONE[key]} size="sm"><Icon className="h-4 w-4" /></IconBadge>
                    <span className="text-sm font-medium text-slate-700">{c.serviceMenu[key].title}</span>
                  </Link>
                );
              })}
              <Link href="/services" onClick={close} className="block px-2.5 py-2 text-xs font-semibold text-slate-500">
                {c.serviceMenu.all} →
              </Link>
            </div>
          )}

          {groupButton("products", c.nav.products)}
          {section === "products" && (
            <div className="mb-2 space-y-1 px-2 pt-1">
              {PRODUCT_KEYS.map((key) => {
                const Icon = PRODUCT_ICONS[key];
                return (
                  <Link key={key} href={PRODUCT_HREF[key]} onClick={close} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50">
                    <IconBadge tone={PRODUCT_TONE[key]} size="sm"><Icon className="h-4 w-4" /></IconBadge>
                    <span className="text-sm font-medium text-slate-700">{c.productMenu[key].title}</span>
                  </Link>
                );
              })}
              <Link href="/features" onClick={close} className="block px-2.5 py-2 text-xs font-semibold text-slate-500">
                {c.nav.features} →
              </Link>
            </div>
          )}

          {[
            { href: "/pricing", label: c.nav.pricing },
            { href: "/fraud-check", label: c.nav.fraudCheck },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="block rounded-xl px-4 py-3.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-4 border-t border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{c.switcher.label}</span>
            <LocaleSwitcher />
          </div>
          <Link
            href={isLoggedIn ? "/dashboard" : "/sign-in"}
            onClick={close}
            className="block w-full rounded-2xl bg-slate-900 py-3.5 text-center text-sm font-bold text-white hover:bg-slate-800"
          >
            {isLoggedIn ? c.nav.dashboard : c.nav.getStarted} →
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
        aria-label={c.nav.openMenu}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Render drawer+backdrop directly into body to bypass all stacking contexts */}
      {mounted && createPortal(drawer, document.body)}
    </div>
  );
}
