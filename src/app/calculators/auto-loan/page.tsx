import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import { CalculatorGuide } from "@/components/content-page";
import AutoLoanCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Auto Loan Calculator with Tax, Fees & Trade-In",
  description:
    "Free car payment calculator. Estimate your monthly auto loan payment including sales tax, dealer fees, add-ons, rebates, and trade-in value, with a full amortization schedule.",
  alternates: { canonical: "/calculators/auto-loan" },
};

const faqs = [
  {
    q: "How is a car payment calculated?",
    a: "Your payment is based on the amount financed (vehicle price plus any taxes, fees, and add-ons you finance, minus your down payment, rebates, and trade-in equity), the APR, and the loan term in months, using the standard amortization formula.",
  },
  {
    q: "Is it better to take a longer car loan to lower my payment?",
    a: "A longer term lowers the monthly payment but increases total interest and raises the risk of owing more than the car is worth. Many experts suggest keeping auto loans to 60 months or less when possible.",
  },
  {
    q: "What is negative equity on a trade-in?",
    a: "Negative equity happens when you owe more on your current car than it is worth. That difference is usually added to your new loan, which increases the amount financed and your monthly payment.",
  },
  {
    q: "Do I pay sales tax on the full price if I trade in a car?",
    a: "In many US states, your trade-in value reduces the taxable price of the new vehicle, but rules vary by state. Use the trade-in tax credit option in the calculator if your state allows it.",
  },
  {
    q: "Should I buy dealer add-ons like GAP coverage or extended warranties?",
    a: "They are optional. Financing add-ons means paying interest on them for the life of the loan. Compare prices from your insurer or credit union before agreeing, and decide whether you actually need the coverage.",
  },
];

export default function AutoLoanPage() {
  return (
    <>
      <div className="bg-slate-50 px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            items={[
              { title: "Calculators", href: "/#calculators" },
              { title: "Auto Loan Calculator" },
            ]}
          />
        </div>
      </div>
      <AutoLoanCalculator />
      <CalculatorGuide title="How to use the auto loan calculator" faqs={faqs}>
        <p>
          Start with the vehicle&apos;s listed price, then enter any
          negotiated discount, your cash down payment, APR, and loan term. You
          can add your trade-in value and payoff, manufacturer rebates, sales
          tax, title and registration fees, and optional dealer add-ons like
          extended warranties or GAP coverage. The calculator shows the amount
          financed, your monthly payment, total interest, and the cash you
          need at signing.
        </p>

        <h3>What goes into the amount you finance</h3>
        <ul>
          <li>
            <strong>Negotiated price</strong> plus any upgrades or accessories.
          </li>
          <li>
            <strong>Sales tax and fees</strong> such as title, registration,
            documentation, and inspection fees, if you choose to finance them.
          </li>
          <li>
            <strong>Dealer add-ons</strong> like service contracts or GAP
            coverage, if financed.
          </li>
          <li>
            <strong>Minus</strong> your cash down payment, rebates, and
            positive trade-in equity (or <strong>plus</strong> any negative
            equity).
          </li>
        </ul>

        <h3>Example: 60 vs. 72 months</h3>
        <p>
          Financing $35,000 at 7% APR for 60 months costs about{" "}
          <strong>$693 per month</strong> and roughly $6,600 in total
          interest. Stretching the same loan to 72 months lowers the payment
          to about <strong>$597</strong>, but total interest rises to roughly
          $8,000. The lower payment costs you about $1,400 more overall, and
          you will be paying for the car for an extra year.
        </p>

        <h3>Tips for a better car loan</h3>
        <ul>
          <li>
            <strong>Get pre-approved</strong> by a bank or credit union before
            visiting the dealer so you can compare offers.
          </li>
          <li>
            <strong>Negotiate the price, not the payment.</strong> Focusing on
            the monthly payment makes it easy to hide a longer term or extra
            add-ons.
          </li>
          <li>
            <strong>Put money down</strong> to reduce interest and avoid owing
            more than the car is worth.
          </li>
          <li>
            <strong>Pay extra principal</strong> when you can. The calculator
            shows how an extra monthly payment shortens your loan.
          </li>
        </ul>
        <p>
          Considering an unsecured loan instead? Compare with our{" "}
          <Link href="/calculators/personal-loan">personal loan calculator</Link>.
        </p>
      </CalculatorGuide>
    </>
  );
}
