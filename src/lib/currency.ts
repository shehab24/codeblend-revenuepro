export type CurrencyOption = {
  code: string;
  symbol: string;
  label: string;
};

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "USD", symbol: "$", label: "USD ($ - US Dollar)" },
  { code: "BDT", symbol: "৳", label: "BDT (৳ - Bangladeshi Taka)" },
  { code: "EUR", symbol: "€", label: "EUR (€ - Euro)" },
  { code: "GBP", symbol: "£", label: "GBP (£ - British Pound)" },
  { code: "AED", symbol: "AED ", label: "AED (AED - UAE Dirham)" },
  { code: "INR", symbol: "₹", label: "INR (₹ - Indian Rupee)" },
];

export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) return "$";
  const upper = currency.trim().toUpperCase();

  switch (upper) {
    case "USD":
    case "$":
      return "$";
    case "EUR":
    case "€":
      return "€";
    case "GBP":
    case "£":
      return "£";
    case "AED":
      return "AED ";
    case "INR":
    case "₹":
      return "₹";
    case "BDT":
    case "৳":
      return "৳";
    default:
      return currency;
  }
}

export const DEFAULT_PREPARED_BY_NAME = "CodeBlend Digital Solutions";
export const DEFAULT_PREPARED_BY_EMAIL = "contact@codeblend.co";
export const DEFAULT_CURRENCY = "USD";

export const DEFAULT_BANK_DETAILS = `Name: Shehab Mahamud
Account Number: 30000002973968
Routing Number: 028000024
Bank: JP Morgan Chase NA (Based in US)
Bank Address: 270 Park Avenue, New York, NY 10017
Recipient Address: Bangladesh, Akon Bari, Barisal, 8224
Account Type: Checking (Current)`;

export const DEFAULT_CLIENT_NAME = "Marie Olivie";
export const DEFAULT_CLIENT_ADDRESS = `Marie Olivie LLC
1931 NW 150th Ave, Ste 257
Pembroke Pines, FL 33028
EIN: 30-1454745`;
