// Marketing-site locale. Language and display currency are tied together:
// "en" = English + USD (default), "bn" = Bangla + BDT.
export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "cb_locale";

export const LOCALE_CURRENCY: Record<Locale, "USD" | "BDT"> = {
  en: "USD",
  bn: "BDT",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

// Localize a plain number (e.g. "50+", "24/7") for the active locale.
export function localizeDigits(value: string | number, locale: Locale): string {
  return locale === "bn" ? toBanglaDigits(value) : String(value);
}
