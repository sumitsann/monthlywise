import Link from "next/link";
import Breadcrumbs from "@/components/breadcrumbs";
import { CalculatorGuide } from "@/components/content-page";
import MortgageCalculator from "./calculator";
import { calculatorJsonLd, JsonLd, pageMetadata } from "@/lib/seo";

const path = "/calculators/mortgage";
const description =
  "Free mortgage calculator. Estimate your monthly house payment including principal, interest, property taxes, homeowners insurance, HOA, and PMI, with an amortization schedule.";

export const metadata = pageMetadata({
  title: "Mortgage Calculator with Taxes, Insurance & PMI",
  description,
  path,
});

const faqs = [
  {
    q: "What is included in a monthly mortgage payment?",
    a: "Most mortgage payments include principal and interest, plus property taxes and homeowners insurance collected through an escrow account (often called PITI). Some homes also have HOA dues, and loans with less than 20% down usually include private mortgage insurance (PMI).",
  },
  {
    q: "How much house can I afford?",
    a: "A common guideline is to keep your total housing payment at or below about 28% of your gross monthly income and your total debt payments at or below about 36%. Lenders use their own criteria, so treat these as starting points.",
  },
  {
    q: "Is a 15-year or 30-year mortgage better?",
    a: "A 15-year loan has a higher monthly payment but usually a lower rate and far less total interest. A 30-year loan has a lower payment and more flexibility. Many borrowers choose a 30-year loan and make extra principal payments when they can.",
  },
  {
    q: "How do extra payments affect my mortgage?",
    a: "Extra principal payments reduce your balance faster, so less interest accrues each month. Even a small extra amount every month can shorten the loan by years and save thousands of dollars in interest.",
  },
  {
    q: "When can I stop paying PMI?",
    a: "On conventional loans, you can typically request PMI removal once your balance reaches 80% of the home's original value, and it is usually removed automatically at 78%. FHA loans have different mortgage insurance rules.",
  },
];

export default function MortgagePage() {
  return (
    <>
      <JsonLd
        data={calculatorJsonLd("Mortgage Calculator", path, description)}
      />
      <div className="bg-slate-50 px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            items={[
              { title: "Calculators", href: "/calculators" },
              { title: "Mortgage Calculator" },
            ]}
          />
        </div>
      </div>
      <MortgageCalculator />
      <CalculatorGuide title="How to use the mortgage calculator" faqs={faqs}>
        <p>
          Enter the home price, your down payment (in dollars or as a
          percentage), the interest rate, and the loan term. The calculator
          instantly shows your estimated monthly principal and interest, plus
          property tax, homeowners insurance, HOA dues, and PMI so you can see
          the full monthly cost of owning the home. Switch to{" "}
          <strong>Advanced</strong> mode to break property tax into individual
          taxing districts and model extra monthly payments.
        </p>

        <h3>How a mortgage payment is calculated</h3>
        <p>
          Fixed-rate mortgages use the standard amortization formula, which
          keeps your principal-and-interest payment the same every month:
        </p>
        <p>
          <code>M = P × r(1 + r)ⁿ ÷ [(1 + r)ⁿ − 1]</code>
        </p>
        <ul>
          <li>
            <strong>M</strong> is the monthly principal and interest payment.
          </li>
          <li>
            <strong>P</strong> is the loan amount (home price minus down
            payment).
          </li>
          <li>
            <strong>r</strong> is the monthly interest rate (annual rate ÷ 12).
          </li>
          <li>
            <strong>n</strong> is the number of monthly payments (years × 12).
          </li>
        </ul>
        <p>
          Early in the loan, most of each payment goes toward interest. As the
          balance falls, more of each payment goes toward principal. The
          amortization schedule shows this month by month.
        </p>

        <h3>Example</h3>
        <p>
          Suppose you buy a $350,000 home with 20% down ($70,000), borrowing
          $280,000 at 6.5% for 30 years. Your principal and interest would be
          about <strong>$1,770 per month</strong>. Add $6,000 a year in
          property taxes ($500/month) and $1,800 a year in insurance
          ($150/month), and your total monthly payment is roughly{" "}
          <strong>$2,420</strong>. Over 30 years you would pay about $357,000
          in interest alone, which is why rate, term, and extra payments
          matter so much.
        </p>

        <h3>Tips to lower your mortgage cost</h3>
        <ul>
          <li>
            <strong>Put 20% down if you can</strong> to avoid PMI and borrow
            less.
          </li>
          <li>
            <strong>Shop multiple lenders.</strong> A rate that is even 0.25%
            lower can save thousands over the life of the loan.
          </li>
          <li>
            <strong>Improve your credit score</strong> before applying to
            qualify for better rates.
          </li>
          <li>
            <strong>Check property tax rates</strong> for the specific address.
            Taxes vary widely between counties, cities, and school districts.
          </li>
          <li>
            <strong>Make extra principal payments</strong> to shorten your loan
            and reduce total interest.
          </li>
        </ul>
        <p>
          Planning your full monthly budget too? Try our{" "}
          <Link href="/calculators/budget">household budget calculator</Link>.
        </p>
      </CalculatorGuide>
    </>
  );
}
