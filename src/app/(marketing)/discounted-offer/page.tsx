import React from "react";
import { prisma } from "@/lib/prisma";
import DiscountedOfferClient from "./DiscountedOfferClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "লিমিটেড এক্সপ্রেস অফার! | RevenuePro",
  description: "আপনার ব্যবসার সুরক্ষা ও সেল বৃদ্ধি করুন আজই। সুযোগটি হাতছাড়া করবেন না!",
};

export default async function DiscountedOfferPage() {
  // Query manual bkash settings from DB
  const [bkashNumberSetting, bkashTypeSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "BKASH_MANUAL_NUMBER" } }),
    prisma.setting.findUnique({ where: { key: "BKASH_MANUAL_TYPE" } }),
  ]);

  const bkashNumber = bkashNumberSetting?.value || "01784962299";
  const bkashType = bkashTypeSetting?.value || "Personal";

  return (
    <DiscountedOfferClient 
      bkashNumber={bkashNumber} 
      bkashType={bkashType} 
    />
  );
}
