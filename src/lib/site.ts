export const SITE_URL = "https://www.monthlywise.com";
export const SITE_NAME = "MonthlyWise";
export const CONTACT_EMAIL = "sumit.o4172@gmail.com";

// AdSense publisher ID; drives the AdSense script, verification meta tag,
// and /ads.txt. NEXT_PUBLIC_ADSENSE_CLIENT can override it.
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9093422774202580";

export const LAST_UPDATED = "October 9, 2026";

export const calculators = [
  { title: "Mortgage Calculator", href: "/calculators/mortgage" },
  { title: "Auto Loan Calculator", href: "/calculators/auto-loan" },
  { title: "Credit Card Payoff Calculator", href: "/calculators/credit-card" },
  { title: "Personal Loan Calculator", href: "/calculators/personal-loan" },
  { title: "Household Budget Calculator", href: "/calculators/budget" },
  { title: "Split Expenses", href: "/groups/new" },
];
