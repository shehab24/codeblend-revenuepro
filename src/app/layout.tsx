import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { FacebookPixel } from "@/components/FacebookPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeBlend — WordPress, Shopify & AI Automation Solutions",
  description: "WordPress & WooCommerce development, Shopify stores and apps, and AI automation for e-commerce — plus our own fraud prevention and payment tools.",
  other: {
    "facebook-domain-verification": "zvxdkdltjgrfkj5c6w7heb2i31ph9l",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <head>
          <meta name="impact-site-verification" {...({ value: "343dfa79-398e-41ad-9428-3b30cb0c9a55" } as any)} />
        </head>
        <body>
          <FacebookPixel />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
