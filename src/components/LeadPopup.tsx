"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, XMarkIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { submitLead } from "@/actions/leadActions";
import { trackFBEvent } from "@/components/FacebookPixel";
import { useLocale } from "@/components/marketing/LocaleProvider";

// Service types that also ask for the customer's website.
const NEEDS_WEBSITE = ["Free Trial", "Monthly Plan", "Quarterly Plan", "Get Started"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10";

export function LeadCTAButton({
  children,
  className,
  serviceType = "General Inquiry",
}: {
  children: React.ReactNode;
  className?: string;
  serviceType?: string;
}) {
  const { common } = useLocale();
  const t = common.lead;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData);

    if (result.success) {
      setStatus("success");
      // Fire client-side Facebook Pixel Lead event
      trackFBEvent("Lead", {
        content_name: serviceType,
        content_category: "Service Request",
      });
    } else {
      setStatus("error");
      setErrorMessage(result.error || "An error occurred.");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setErrorMessage("");
    }, 300);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const modal = isOpen ? (
    <>
      <div onClick={handleClose} className="fixed inset-0 z-[99998] bg-slate-900/60 backdrop-blur-sm" />

      <div className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="pointer-events-auto relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >
          <button
            onClick={handleClose}
            aria-label={t.close}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="p-7 sm:p-8">
            {status === "success" ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="h-8 w-8" strokeWidth={2.5} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{t.successTitle}</h3>
                <p className="mb-2 text-sm leading-relaxed text-slate-500">{t.successBody}</p>
                <p className="mb-7 text-xs text-slate-400">
                  {t.service}: <strong className="text-slate-700">{serviceType}</strong>
                </p>
                <Link
                  href="/sign-in"
                  className="mb-3 block w-full rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold text-white hover:bg-emerald-700"
                >
                  {t.signIn}
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 pr-6">
                  <h2 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">{t.title}</h2>
                  <p className="mt-1.5 text-sm text-slate-500">{t.subtitle}</p>
                </div>

                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-800">
                    {t.service}: {serviceType}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="serviceType" value={serviceType} />

                  {/* ── ANTI-SPAM HONEYPOT ── */}
                  <div style={{ display: "none" }} aria-hidden="true">
                    <label htmlFor="website_url">Website URL (Leave empty)</label>
                    <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      {t.name} <span className="text-rose-500">*</span>
                    </span>
                    <input type="text" name="name" required placeholder={t.namePlaceholder} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      {t.email} <span className="text-rose-500">*</span>
                    </span>
                    <input type="email" name="email" required placeholder="you@company.com" className={inputClass} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      {t.phone} <span className="text-rose-500">*</span>
                    </span>
                    <input type="tel" name="phone" required placeholder="+880 1XXX-XXXXXX" className={inputClass} />
                  </label>
                  {NEEDS_WEBSITE.includes(serviceType) && (
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        {t.website} <span className="text-rose-500">*</span>
                      </span>
                      <input type="url" name="websiteUrl" required placeholder="https://yourwebsite.com" className={inputClass} />
                    </label>
                  )}
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">{t.message}</span>
                    <textarea name="message" rows={3} placeholder={t.messagePlaceholder} className={`${inputClass} resize-none`} />
                  </label>

                  {status === "error" && <p className="text-sm font-medium text-rose-500">{errorMessage}</p>}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                  >
                    {status === "loading" ? t.submitting : t.submit}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
