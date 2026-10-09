import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import SiteFooter from "@/components/site-footer";
import ThemeToggle from "@/components/theme-toggle";
import { ADSENSE_CLIENT, SITE_NAME, SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MonthlyWise | Free Financial Calculators",
    template: "%s | MonthlyWise",
  },
  description:
    "Make smarter financial decisions with free mortgage, auto loan, personal loan, credit card, budget, and shared-expense calculators.",
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
      "Free financial tools for mortgages, car loans, budgets, credit cards, and shared expenses.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  ...(ADSENSE_CLIENT && {
    other: { "google-adsense-account": ADSENSE_CLIENT },
  }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {ADSENSE_CLIENT ? (
        <head>
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        </head>
      ) : null}
      <body className="flex min-h-full flex-col">
        <Script id="monthlywise-theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var saved = localStorage.getItem("monthlywise-theme");

                var theme =
                  saved === "light" || saved === "dark"
                    ? saved
                    : window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? "dark"
                      : "light";

                document.documentElement.dataset.theme = theme;
              } catch (error) {
                document.documentElement.dataset.theme = "light";
              }
            })();
          `}
        </Script>

        <div className="flex-1">{children}</div>
        <SiteFooter />
        <ThemeToggle />
      </body>
    </html>
  );
}
