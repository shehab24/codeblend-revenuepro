import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { FraudCheckClient } from "./FraudCheckClient";

export const metadata: Metadata = {
  title: "Courier Fraud Check — CodeBlend",
  description: "Check a Bangladeshi mobile number's delivery history across Steadfast, Pathao, RedX and more.",
};

export default async function FraudCheckPage() {
  const { t } = await getI18n();
  return <FraudCheckClient t={t.fraud} />;
}
