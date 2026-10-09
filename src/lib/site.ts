export const SITE_URL = "https://www.monthlywise.com";
export const SITE_NAME = "MonthlyWise";
export const CONTACT_EMAIL = "contact@monthlywise.com";

// Set NEXT_PUBLIC_ADSENSE_CLIENT (e.g. "ca-pub-1234567890123456") in Vercel
// to load the AdSense script and serve /ads.txt.
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const LAST_UPDATED = "October 9, 2026";

export const calculators = [
  { title: "Mortgage Calculator", href: "/calculators/mortgage" },
  { title: "Auto Loan Calculator", href: "/calculators/auto-loan" },
  { title: "Credit Card Payoff Calculator", href: "/calculators/credit-card" },
  { title: "Personal Loan Calculator", href: "/calculators/personal-loan" },
  { title: "Household Budget Calculator", href: "/calculators/budget" },
  { title: "Split Expenses", href: "/groups/new" },
];
