import Link from "next/link";

export const tools = [
  {
    icon: "🏠",
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payment, including taxes and insurance.",
    href: "/calculators/mortgage",
  },
  {
    icon: "🚗",
    title: "Auto Loan Calculator",
    description: "Calculate car payments, interest, taxes, and fees.",
    href: "/calculators/auto-loan",
  },
  {
    icon: "💳",
    title: "Credit Card Payoff",
    description: "Find out how long it will take to pay off your credit card.",
    href: "/calculators/credit-card",
  },
  {
    icon: "💵",
    title: "Personal Loan Calculator",
    description: "Estimate loan payments and total interest.",
    href: "/calculators/personal-loan",
  },
  {
    icon: "📊",
    title: "Household Budget",
    description: "Plan monthly income, expenses, and savings.",
    href: "/calculators/budget",
  },
  {
    icon: "👥",
    title: "Split Expenses",
    description: "Share expenses with friends, roommates, and family.",
    href: "/groups/new",
  },
];

export default function CalculatorGrid() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.href}>
          <Link
            href={tool.href}
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg motion-reduce:hover:translate-y-0 dark:hover:border-blue-500"
          >
            <span aria-hidden="true" className="text-4xl">
              {tool.icon}
            </span>
            <span className="mt-5 text-xl font-bold text-slate-900 group-hover:text-blue-700 dark:group-hover:text-blue-300">
              {tool.title}
            </span>
            <span className="mt-3 flex-1 text-[15px] leading-6 text-slate-600">
              {tool.description}
            </span>
            <span className="mt-6 font-semibold text-blue-700 dark:text-blue-400">
              Open calculator <span aria-hidden="true">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
