import Link from "next/link";
import { GuideArticle, guideMetadata } from "@/components/guide-article";

const slug = "how-much-house-can-i-afford";

export const metadata = guideMetadata(slug);

export default function Guide() {
  return (
    <GuideArticle slug={slug}>
      <p>
        Buying a home is usually the biggest purchase of your life, so the
        question isn&apos;t just &quot;how much will a bank lend me?&quot; but
        &quot;how much can I comfortably pay every month?&quot; Those can be
        very different numbers. This guide walks through how lenders think
        about affordability and how to find a price that fits your real
        budget.
      </p>

      <h2 className="text-2xl font-bold">The 28/36 rule</h2>
      <p>
        Many lenders start with a simple guideline based on your{" "}
        <strong>gross</strong> (pre-tax) monthly income:
      </p>
      <ul>
        <li>
          <strong>28%</strong> — your total housing payment (principal,
          interest, property taxes, homeowners insurance, and any HOA or PMI)
          should be no more than 28% of gross monthly income.
        </li>
        <li>
          <strong>36%</strong> — all of your monthly debt payments combined
          (housing plus car loans, student loans, credit card minimums, etc.)
          should be no more than 36%.
        </li>
      </ul>
      <p>
        These percentages are called your <em>debt-to-income ratios</em>. Some
        loan programs allow higher ratios, but staying near 28/36 leaves room
        for savings, emergencies, and everyday life.
      </p>

      <h2 className="text-2xl font-bold">A worked example</h2>
      <p>
        Say your household earns <strong>$90,000 a year</strong>, or $7,500 a
        month before taxes, and you have a $400 car payment.
      </p>
      <ol>
        <li>
          Housing limit: 28% × $7,500 = <strong>$2,100</strong> per month.
        </li>
        <li>
          Total debt limit: 36% × $7,500 = $2,700. Subtract the $400 car
          payment and you have $2,300 available for housing. The lower of the
          two numbers, $2,100, is your target.
        </li>
        <li>
          Subtract estimated property taxes and insurance — say $550 a month —
          leaving about <strong>$1,550</strong> for principal and interest.
        </li>
        <li>
          At a 6.5% rate on a 30-year loan, $1,550 a month supports a loan of
          roughly <strong>$245,000</strong>.
        </li>
        <li>
          With a 10% down payment, that points to a home price of about{" "}
          <strong>$272,000</strong>.
        </li>
      </ol>
      <p>
        Change any input — a lower rate, a bigger down payment, or higher
        property taxes — and the answer shifts. That&apos;s why it helps to
        test several scenarios in a{" "}
        <Link href="/calculators/mortgage">mortgage calculator</Link>.
      </p>

      <h2 className="text-2xl font-bold">Costs people forget</h2>
      <ul>
        <li>
          <strong>Closing costs</strong>, typically 2%–5% of the loan amount.
        </li>
        <li>
          <strong>PMI</strong> if you put down less than 20% on a
          conventional loan.
        </li>
        <li>
          <strong>Maintenance</strong> — a common rule of thumb is to budget
          1%–2% of the home&apos;s value each year for repairs.
        </li>
        <li>
          <strong>Higher utilities</strong>, furniture, and moving costs.
        </li>
        <li>
          <strong>Property tax increases</strong> after a reassessment.
        </li>
      </ul>

      <h2 className="text-2xl font-bold">Approved vs. comfortable</h2>
      <p>
        Lenders look at gross income, but you pay bills with take-home pay.
        If you have childcare costs, irregular income, or big savings goals,
        you may want a payment well below what you are approved for. A good
        test: build a{" "}
        <Link href="/calculators/budget">monthly budget</Link> with the new
        housing payment and check that you can still save at least 10%–20% of
        your income.
      </p>

      <h2 className="text-2xl font-bold">Ways to afford more house</h2>
      <ul>
        <li>Pay down other debts to lower your debt-to-income ratio.</li>
        <li>Improve your credit score to qualify for a lower rate.</li>
        <li>Save a larger down payment to borrow less and avoid PMI.</li>
        <li>Compare offers from at least three lenders.</li>
      </ul>

      <h2 className="text-2xl font-bold">The bottom line</h2>
      <p>
        Use the 28/36 rule as a starting point, include every cost of
        ownership, and choose a payment that still lets you save. A home you
        can comfortably afford is far less stressful than the most expensive
        home you can qualify for.
      </p>
    </GuideArticle>
  );
}
