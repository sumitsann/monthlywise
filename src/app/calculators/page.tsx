import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import CalculatorGrid from "@/components/calculator-grid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Financial Calculators",
  description:
    "All MonthlyWise calculators in one place: mortgage, auto loan, personal loan, credit card payoff, household budget, and split expenses. Free, instant, no sign-up.",
  path: "/calculators",
});

export default function CalculatorsPage() {
  return (
    <main className="bg-slate-50 px-4 pb-16 pt-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={[{ title: "Calculators" }]} />

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Free financial calculators
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          Work out monthly payments, total interest, payoff dates, and budgets
          in seconds. Every calculator is free, runs in your browser, and
          includes a step-by-step guide explaining the math.
        </p>

        <div className="mt-10">
          <CalculatorGrid />
        </div>

        <section className="prose-content mt-14 max-w-3xl">
          <h2 className="text-2xl font-bold">Which calculator do I need?</h2>
          <ul>
            <li>
              <strong>Buying a home?</strong> Start with the{" "}
              <Link href="/calculators/mortgage">mortgage calculator</Link> to
              see your full monthly payment, including taxes, insurance, and
              PMI.
            </li>
            <li>
              <strong>Shopping for a car?</strong> The{" "}
              <Link href="/calculators/auto-loan">auto loan calculator</Link>{" "}
              includes sales tax, dealer fees, rebates, and trade-in value.
            </li>
            <li>
              <strong>Paying down credit cards?</strong> Compare the avalanche
              and snowball methods with the{" "}
              <Link href="/calculators/credit-card">
                credit card payoff calculator
              </Link>
              .
            </li>
            <li>
              <strong>Borrowing for a big expense?</strong> The{" "}
              <Link href="/calculators/personal-loan">
                personal loan calculator
              </Link>{" "}
              shows how origination fees change your real cost.
            </li>
            <li>
              <strong>Planning your month?</strong> Build a plan with the{" "}
              <Link href="/calculators/budget">budget calculator</Link>, or
              share costs with roommates using{" "}
              <Link href="/groups/new">Split Expenses</Link>.
            </li>
          </ul>
          <p>
            Want the background first? Browse our{" "}
            <Link href="/guides">money guides</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
