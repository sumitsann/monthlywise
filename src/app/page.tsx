import Link from "next/link";
import CalculatorGrid from "@/components/calculator-grid";
import GuideList from "@/components/guide-list";
import { JsonLd, organizationJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Mortgage, Loan & Budget Calculators | MonthlyWise",
  absoluteTitle: true,
  description:
    "Free mortgage, auto loan, personal loan, credit card payoff, budget, and split-expense calculators. Instant results, no sign-up, with plain-English money guides.",
  path: "/",
});

const features = [
  {
    title: "Instant results",
    text: "Every calculator updates as you type. No sign-up, no email required.",
  },
  {
    title: "Private by design",
    text: "Calculator inputs stay in your browser and are never sent to our servers.",
  },
  {
    title: "Transparent math",
    text: "See amortization schedules, total interest, and the formulas behind each result.",
  },
];

export default function Home() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <JsonLd data={organizationJsonLd} />
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
        <p className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          Mortgage · Auto loan · Credit card · Budget
        </p>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Free financial calculators for{" "}
          <span className="text-blue-700 dark:text-blue-400">
            smarter monthly decisions.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Simple, free calculators for mortgages, car loans, credit cards,
          personal loans, household budgets, and shared expenses, plus
          plain-English guides to help you understand the numbers.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#calculators"
            className="w-full rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white transition hover:bg-blue-800 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Explore calculators
          </a>
          <Link
            href="/guides"
            className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-900 transition hover:border-blue-400 hover:text-blue-700 sm:w-auto"
          >
            Read money guides
          </Link>
        </div>
      </section>

      {/* Calculators */}
      <section
        id="calculators"
        aria-labelledby="calculators-heading"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6"
      >
        <h2
          id="calculators-heading"
          className="text-3xl font-bold tracking-tight text-slate-900"
        >
          Calculators
        </h2>
        <p className="mt-2 text-lg text-slate-600">
          Choose a tool to get started.
        </p>

        <div className="mt-8">
          <CalculatorGrid />
        </div>
      </section>

      {/* Why MonthlyWise */}
      <section
        aria-labelledby="why-heading"
        className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            id="why-heading"
            className="text-center text-3xl font-bold tracking-tight text-slate-900"
          >
            Financial planning made simple
          </h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <li key={feature.title} className="text-center">
                <h3 className="text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Guides */}
      <section
        aria-labelledby="guides-heading"
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="guides-heading"
              className="text-3xl font-bold tracking-tight text-slate-900"
            >
              Latest guides
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Learn the ideas behind the numbers.
            </p>
          </div>
          <Link
            href="/guides"
            className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            View all guides <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-8">
          <GuideList limit={3} />
        </div>
      </section>
    </main>
  );
}
