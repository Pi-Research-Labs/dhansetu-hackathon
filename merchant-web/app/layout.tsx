import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DhanSetu Merchant Portal",
    template: "%s · DhanSetu",
  },
  description:
    "Record sales by voice, track your cash flow, and see early warnings before a shortfall — the DhanSetu merchant portal for rural enterprises.",
  applicationName: "DhanSetu Merchant Portal",
  keywords: [
    "DhanSetu",
    "rural finance",
    "cash flow forecasting",
    "micro-enterprise credit",
    "voice ledger",
    "NABARD",
  ],
  openGraph: {
    title: "DhanSetu Merchant Portal",
    description:
      "Record sales by voice, track your cash flow, and see early warnings before a shortfall.",
    siteName: "DhanSetu",
    type: "website",
    locale: "en_IN",
  },
  // The portal shows one merchant's own financial position behind a login, so
  // there is nothing here worth indexing and good reason not to.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
