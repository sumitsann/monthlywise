import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
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
    default: "Free Mortgage, Loan & Budget Calculators | MonthlyWise",
    template: "%s | MonthlyWise",
  },
  description:
    "Free mortgage, auto loan, personal loan, credit card payoff, budget, and split-expense calculators with plain-English money guides.",
  applicationName: SITE_NAME,
  authors: [{ name: `${SITE_NAME} Editorial Team`, url: `${SITE_URL}/about` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: SITE_NAME, locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(ADSENSE_CLIENT && {
    other: { "google-adsense-account": ADSENSE_CLIENT },
  }),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-US"
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

        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {/* usePathname needs a Suspense boundary on dynamic routes */}
        <Suspense fallback={<HeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <SiteFooter />
        <ThemeToggle />
        <SpeedInsights />
      </body>
    </html>
  );
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Monthly<span className="text-blue-700 dark:text-blue-400">Wise</span>
        </Link>
      </div>
    </header>
  );
}
