"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type LocaleContextValue = {
  locale: Locale;
  common: Dictionary["common"];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Only the small `common` slice is shared through context; page-specific copy is
// passed to client components as props so both dictionaries never ship to the browser.
export function LocaleProvider({
  locale,
  common,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  return <LocaleContext.Provider value={{ locale, common }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
