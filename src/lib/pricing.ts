import { type Locale, toBanglaDigits } from "@/lib/i18n/config";

// Single source of truth for marketing-site plan prices.
// Prices are stored in BDT; USD is derived from this fixed rate.
export const USD_BDT_RATE = 122;

export type ProductKey = "revenuepro" | "codepay" | "expense";
export type BillingPeriod = "month" | "sixMonths" | "year" | "lifetime" | "included";

export type Plan = {
  id: string;
  bdt: number; // 0 = free / included
  period: BillingPeriod;
  highlight?: boolean;
  leadService: string; // stored as ServiceRequest.serviceType — keep in English
  href?: string; // plans that link instead of opening the lead form
};

export const PRODUCT_PLANS: Record<ProductKey, Plan[]> = {
  revenuepro: [
    { id: "monthly", bdt: 249, period: "month", leadService: "RevenuePro Monthly" },
    { id: "sixMonths", bdt: 1499, period: "sixMonths", highlight: true, leadService: "RevenuePro 6 Months" },
    { id: "yearly", bdt: 2999, period: "year", leadService: "RevenuePro 1 Year" },
  ],
  codepay: [
    { id: "monthly", bdt: 150, period: "month", leadService: "CodePay Monthly" },
    { id: "sixMonths", bdt: 900, period: "sixMonths", highlight: true, leadService: "CodePay 6 Months" },
    { id: "lifetime", bdt: 2499, period: "lifetime", leadService: "CodePay Lifetime" },
  ],
  expense: [
    { id: "local", bdt: 999, period: "lifetime", leadService: "Expense Tracker Local Lifetime" },
    { id: "cloud", bdt: 1499, period: "lifetime", highlight: true, leadService: "Expense Tracker Cloud Lifetime" },
    { id: "bundle", bdt: 0, period: "included", leadService: "RevenuePro Bundle", href: "/revenuepro" },
  ],
};

export function bdtToUsd(bdt: number): number {
  return Math.round((bdt / USD_BDT_RATE) * 100) / 100;
}

// "$2.04" for en, "৳২৪৯" for bn. Returns null for free plans so callers can show their own label.
export function formatPrice(bdt: number, locale: Locale): string | null {
  if (bdt <= 0) return null;
  if (locale === "bn") {
    return `৳${toBanglaDigits(bdt.toLocaleString("en-US"))}`;
  }
  return `$${bdtToUsd(bdt).toFixed(2)}`;
}
