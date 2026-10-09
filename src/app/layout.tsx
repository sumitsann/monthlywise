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
  title: "MonthlyWise | Free Financial Calculators",
  description:
    "Make smarter financial decisions with MonthlyWise. Calculate mortgage payments, auto loans, personal loans, credit card payoff plans, household budgets, and split group expenses for free.",
  keywords: [
    "MonthlyWise",
    "mortgage calculator",
    "car payment calculator",
    "personal loan calculator",
    "credit card payoff calculator",
    "household budget calculator",
    "split expenses",
    "free financial calculators",
  ],
  openGraph: {
    title: "MonthlyWise | Free Financial Calculators",
    description:
      "Free, easy-to-use calculators for mortgages, car loans, budgets, credit cards, and shared expenses.",
    type: "website",
  },
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
