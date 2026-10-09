import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import { CalculatorGuide } from "@/components/content-page";
import PersonalLoanCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Personal Loan Calculator with Origination Fees",
  description:
    "Free personal loan calculator. Estimate monthly payments, total interest, and the true cost of origination fees, with an amortization schedule and extra-payment options.",
  alternates: { canonical: "/calculators/personal-loan" },
};

const faqs = [
  {
    q: "What is an origination fee?",
    a: "An origination fee is a one-time charge some lenders take for processing a loan, typically 1% to 10% of the loan amount. It is often deducted from the money you receive, so you may get less cash than the amount you borrow.",
  },
  {
    q: "What is the difference between interest rate and APR?",
    a: "The interest rate is the cost of borrowing the principal. APR includes the interest rate plus certain fees, such as origination fees, expressed as a yearly rate. APR is usually the better number for comparing loan offers.",
  },
  {
    q: "Can I pay off a personal loan early?",
    a: "Most personal loans allow early payoff without a penalty, which saves interest. Check your loan agreement for any prepayment penalty before making large extra payments.",
  },
  {
    q: "What credit score do I need for a personal loan?",
    a: "Requirements vary by lender. Borrowers with good to excellent credit generally qualify for the lowest rates, while lower scores may mean higher rates or fees.",
  },
];

export default function PersonalLoanPage() {
  return (
    <>
      <div className="bg-slate-50 px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            items={[
              { title: "Calculators", href: "/#calculators" },
              { title: "Personal Loan Calculator" },
            ]}
          />
        </div>
      </div>
      <PersonalLoanCalculator />
      <CalculatorGuide
        title="How to use the personal loan calculator"
        faqs={faqs}
      >
        <p>
          Enter the loan amount, interest rate, and term in months. If your
          lender charges an origination fee or a fixed fee, add it to see how
          much cash you will actually receive and what the loan really costs.
          You can also add an extra monthly principal payment to see how much
          sooner you would be debt-free.
        </p>

        <h3>How personal loan payments work</h3>
        <p>
          Personal loans are usually fixed-rate installment loans: you borrow
          a lump sum and repay it in equal monthly payments over a set term,
          commonly 24 to 60 months. Each payment covers that month&apos;s
          interest first, and the rest reduces your balance. The payment is
          calculated with the standard amortization formula{" "}
          <code>M = P × r(1 + r)ⁿ ÷ [(1 + r)ⁿ − 1]</code>, where P is the
          amount financed, r is the monthly rate, and n is the number of
          payments.
        </p>

        <h3>Example</h3>
        <p>
          A $10,000 loan at 12% for 36 months has a payment of about{" "}
          <strong>$332 per month</strong> and costs roughly $1,960 in
          interest. If the lender charges a 5% origination fee deducted from
          the loan, you would receive only <strong>$9,500</strong> while still
          repaying the full $10,000 plus interest, making your real borrowing
          cost closer to $2,460.
        </p>

        <h3>Common uses for personal loans</h3>
        <ul>
          <li>
            <strong>Debt consolidation:</strong> replacing high-interest
            credit card balances with one fixed payment at a lower rate.
          </li>
          <li>
            <strong>Home repairs or improvements</strong> without using home
            equity.
          </li>
          <li>
            <strong>Large or unexpected expenses</strong> such as medical
            bills or moving costs.
          </li>
        </ul>

        <h3>Before you borrow</h3>
        <ul>
          <li>Compare APRs from several lenders, not just interest rates.</li>
          <li>Choose the shortest term with a payment you can comfortably afford.</li>
          <li>Make sure the new payment fits your monthly budget.</li>
        </ul>
        <p>
          Consolidating credit cards? See how long payoff would take on your
          own with our{" "}
          <Link href="/calculators/credit-card">credit card payoff calculator</Link>
          .
        </p>
      </CalculatorGuide>
    </>
  );
}
