import Link from "next/link";

const tools = [
  {
    icon: "🏠",
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payment, including taxes and insurance.",
    href: "/mortgage",
  },
  {
    icon: "🚗",
    title: "Auto Loan Calculator",
    description: "Calculate car payments, interest, taxes, and fees.",
    href: "/auto-loan",
  },
  {
    icon: "💳",
    title: "Credit Card Payoff",
    description: "Find out how long it will take to pay off your credit card.",
    href: "/credit-card",
  },
  {
    icon: "💵",
    title: "Personal Loan Calculator",
    description: "Estimate loan payments and total interest.",
    href: "/personal-loan",
  },
  {
    icon: "📊",
    title: "Household Budget",
    description: "Plan monthly income, expenses, and savings.",
    href: "/budget",
  },
  {
    icon: "👥",
    title: "Split Expenses",
    description: "Share expenses with friends, roommates, and family.",
    href: "/split-expenses",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            MonthlyWise
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <a href="#calculators" className="hover:text-blue-700">
              Calculators
            </a>
            <a href="#about" className="hover:text-blue-700">
              About
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
          Free Financial Tools
        </span>

        <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Make smarter money decisions
          <span className="block text-blue-700">with MonthlyWise.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Simple, free calculators for mortgages, car loans, credit cards,
          personal loans, household budgets, and shared expenses.
        </p>

        <a
          href="#calculators"
          className="mt-8 inline-block rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Explore Calculators
        </a>
      </section>

      <section id="calculators" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Explore our tools</h2>
          <p className="mt-2 text-slate-600">
            Choose a calculator to get started.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="mb-5 text-4xl">{tool.icon}</div>
              <h3 className="text-xl font-bold group-hover:text-blue-700">
                {tool.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {tool.description}
              </p>
              <div className="mt-6 font-semibold text-blue-700">
                Open calculator →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="about" className="bg-blue-50 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Financial planning made simple</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          MonthlyWise helps you understand monthly payments, manage your budget,
          and split shared expenses without complicated spreadsheets.
        </p>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        © 2026 MonthlyWise. Free financial calculators.
      </footer>
    </main>
  );
}
