import Link from "next/link";
import {
  BanknoteIcon,
  CarIcon,
  CreditCardIcon,
  HomeIcon,
  PieChartIcon,
  UsersIcon,
} from "@/components/icons";

export const tools = [
  {
    icon: HomeIcon,
    iconClass:
      "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payment, including taxes and insurance.",
    href: "/calculators/mortgage",
  },
  {
    icon: CarIcon,
    iconClass:
      "bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
    title: "Auto Loan Calculator",
    description: "Calculate car payments, interest, taxes, and fees.",
    href: "/calculators/auto-loan",
  },
  {
    icon: CreditCardIcon,
    iconClass:
      "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
    title: "Credit Card Payoff",
    description: "Find out how long it will take to pay off your credit card.",
    href: "/calculators/credit-card",
  },
  {
    icon: BanknoteIcon,
    iconClass:
      "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    title: "Personal Loan Calculator",
    description: "Estimate loan payments and total interest.",
    href: "/calculators/personal-loan",
  },
  {
    icon: PieChartIcon,
    iconClass:
      "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    title: "Household Budget",
    description: "Plan monthly income, expenses, and savings.",
    href: "/calculators/budget",
  },
  {
    icon: UsersIcon,
    iconClass:
      "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
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
            <span
              aria-hidden="true"
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ${tool.iconClass}`}
            >
              <tool.icon className="h-7 w-7" />
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
