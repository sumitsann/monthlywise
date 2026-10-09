export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  published: string; // ISO date
  calculator: { title: string; href: string };
};

export const guides: Guide[] = [
  {
    slug: "how-much-house-can-i-afford",
    title: "How Much House Can I Afford? The 28/36 Rule Explained",
    description:
      "Learn how lenders decide what you can borrow, how the 28/36 rule works, and how to find a home price that fits your budget.",
    category: "Mortgages",
    readMinutes: 6,
    published: "2026-10-09",
    calculator: { title: "Mortgage Calculator", href: "/calculators/mortgage" },
  },
  {
    slug: "debt-avalanche-vs-snowball",
    title: "Debt Avalanche vs. Snowball: Which Payoff Method Is Better?",
    description:
      "Compare the two most popular ways to pay off credit card debt, see how each works step by step, and choose the one that fits you.",
    category: "Debt",
    readMinutes: 5,
    published: "2026-10-09",
    calculator: {
      title: "Credit Card Payoff Calculator",
      href: "/calculators/credit-card",
    },
  },
  {
    slug: "how-to-make-a-monthly-budget",
    title: "How to Make a Monthly Budget in 6 Simple Steps",
    description:
      "A practical, beginner-friendly guide to building a monthly budget you can actually stick to, including the 50/30/20 rule.",
    category: "Budgeting",
    readMinutes: 6,
    published: "2026-10-09",
    calculator: {
      title: "Household Budget Calculator",
      href: "/calculators/budget",
    },
  },
  {
    slug: "how-long-should-a-car-loan-be",
    title: "How Long Should a Car Loan Be? 48 vs. 60 vs. 72 Months",
    description:
      "See how loan term changes your monthly car payment and total interest, and learn how to pick the right auto loan length.",
    category: "Auto Loans",
    readMinutes: 5,
    published: "2026-10-09",
    calculator: {
      title: "Auto Loan Calculator",
      href: "/calculators/auto-loan",
    },
  },
  {
    slug: "apr-vs-interest-rate",
    title: "APR vs. Interest Rate: What's the Difference?",
    description:
      "Understand why APR is usually higher than the interest rate, how loan fees affect it, and how to use APR to compare loan offers.",
    category: "Loans",
    readMinutes: 4,
    published: "2026-10-09",
    calculator: {
      title: "Personal Loan Calculator",
      href: "/calculators/personal-loan",
    },
  },
  {
    slug: "how-to-split-expenses-with-roommates",
    title: "How to Split Expenses With Roommates Fairly",
    description:
      "Fair ways to divide rent, utilities, and groceries with roommates or a partner, plus tips to avoid money arguments.",
    category: "Shared Expenses",
    readMinutes: 5,
    published: "2026-10-09",
    calculator: { title: "Split Expenses", href: "/groups/new" },
  },
];

export function getGuide(slug: string) {
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) throw new Error(`Unknown guide: ${slug}`);
  return guide;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
