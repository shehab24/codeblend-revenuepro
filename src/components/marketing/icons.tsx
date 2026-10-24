import {
  ChartBarIcon,
  CodeBracketSquareIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const PILLAR_ICONS = {
  wordpress: CodeBracketSquareIcon,
  ai: SparklesIcon,
  shopify: ShoppingBagIcon,
};

export const PRODUCT_ICONS = {
  revenuepro: ShieldCheckIcon,
  codepay: CreditCardIcon,
  expense: ChartBarIcon,
};

export const PILLAR_KEYS = ["wordpress", "ai", "shopify"] as const;
export const PRODUCT_KEYS = ["revenuepro", "codepay", "expense"] as const;

export type PillarKey = (typeof PILLAR_KEYS)[number];

// URL slug for each service page: /services/[slug]
export const PILLAR_SLUG: Record<PillarKey, string> = {
  wordpress: "wordpress",
  ai: "ai-automation",
  shopify: "shopify",
};

export const PILLAR_HREF: Record<PillarKey, string> = {
  wordpress: "/services/wordpress",
  ai: "/services/ai-automation",
  shopify: "/services/shopify",
};

export function pillarFromSlug(slug: string): PillarKey | null {
  return PILLAR_KEYS.find((key) => PILLAR_SLUG[key] === slug) ?? null;
}

export const PRODUCT_HREF = {
  revenuepro: "/revenuepro",
  codepay: "/codepay",
  expense: "/expense-tracker",
};

export const WHATSAPP_URL = "https://wa.me/8801570296656";
