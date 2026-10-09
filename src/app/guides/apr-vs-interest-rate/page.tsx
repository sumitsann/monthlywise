import Link from "next/link";
import { GuideArticle, guideMetadata } from "@/components/guide-article";

const slug = "apr-vs-interest-rate";

export const metadata = guideMetadata(slug);

export default function Guide() {
  return (
    <GuideArticle slug={slug}>
      <p>
        When you shop for a loan, you&apos;ll usually see two percentages: the
        interest rate and the APR. They sound similar, but they measure
        different things — and using the wrong one can make an expensive loan
        look cheap.
      </p>

      <h2 className="text-2xl font-bold">Interest rate</h2>
      <p>
        The <strong>interest rate</strong> is the yearly cost of borrowing the
        principal, expressed as a percentage. It is what determines your
        monthly payment. It does not include any upfront fees.
      </p>

      <h2 className="text-2xl font-bold">APR (annual percentage rate)</h2>
      <p>
        The <strong>APR</strong> includes the interest rate <em>plus</em>{" "}
        certain fees, such as origination fees, spread over the life of the
        loan and expressed as a yearly rate. In the United States, the Truth
        in Lending Act requires lenders to disclose APR so borrowers can
        compare offers on equal footing.
      </p>
      <p>
        Because it includes fees, APR is usually equal to or higher than the
        interest rate. If a loan has no fees, the two are the same.
      </p>

      <h2 className="text-2xl font-bold">Example</h2>
      <p>
        You borrow <strong>$10,000 for 3 years at 10% interest</strong>. The
        monthly payment is about $323. But the lender charges a $400
        origination fee taken out of the loan, so you only receive $9,600.
      </p>
      <p>
        You are paying $323 a month for $9,600 of actual cash, which works out
        to an APR of roughly <strong>12.8%</strong>, even though the interest
        rate is 10%. A competing offer at 11% with no fees would actually be
        cheaper.
      </p>

      <h2 className="text-2xl font-bold">When APR can mislead</h2>
      <ul>
        <li>
          <strong>Paying off early:</strong> APR assumes you keep the loan for
          the full term. If you repay early, upfront fees make the effective
          cost higher than the APR suggests.
        </li>
        <li>
          <strong>Mortgages:</strong> mortgage APR includes some closing costs
          but not all of them, and different lenders may count fees
          differently.
        </li>
        <li>
          <strong>Credit cards:</strong> for credit cards, APR and interest
          rate are essentially the same thing, since there&apos;s no upfront
          fee built in. Annual fees and balance transfer fees are separate.
        </li>
        <li>
          <strong>Variable rates:</strong> the APR shown may change if the
          loan&apos;s rate is tied to an index.
        </li>
      </ul>

      <h2 className="text-2xl font-bold">How to compare loan offers</h2>
      <ol>
        <li>Compare APRs for loans with the same term.</li>
        <li>Check the monthly payment to make sure it fits your budget.</li>
        <li>Look at total cost: all payments plus any fees.</li>
        <li>Ask about prepayment penalties if you might pay early.</li>
      </ol>

      <p>
        Our <Link href="/calculators/personal-loan">personal loan calculator</Link>{" "}
        lets you add an origination fee and shows the cash you&apos;ll
        receive and the true borrowing cost side by side.
      </p>
    </GuideArticle>
  );
}
