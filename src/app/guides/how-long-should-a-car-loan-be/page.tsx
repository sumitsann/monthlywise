import Link from "next/link";
import { GuideArticle, guideMetadata } from "@/components/guide-article";

const slug = "how-long-should-a-car-loan-be";

export const metadata = guideMetadata(slug);

const rows = [
  { term: "60 months", payment: "$693", interest: "$6,580" },
  { term: "72 months", payment: "$597", interest: "$7,960" },
  { term: "84 months", payment: "$528", interest: "$9,380" },
];

export default function Guide() {
  return (
    <GuideArticle slug={slug}>
      <p>
        Car loans now commonly stretch to 72 or even 84 months. A longer term
        makes the monthly payment look smaller, but it changes how much the
        car really costs and how long you&apos;re tied to the loan. Here&apos;s
        how to think about the trade-off.
      </p>

      <h2 className="text-2xl font-bold">How term affects your payment</h2>
      <p>
        Here is the same $35,000 loan at 7% APR over three different terms
        (rounded):
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse text-left text-[15px]">
          <caption className="sr-only">
            Monthly payment and total interest on a $35,000 loan at 7% APR
          </caption>
          <thead>
            <tr className="border-b border-slate-300">
              <th scope="col" className="py-2 pr-4">Loan term</th>
              <th scope="col" className="py-2 pr-4">Monthly payment</th>
              <th scope="col" className="py-2">Total interest</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.term} className="border-b border-slate-200">
                <th scope="row" className="py-2 pr-4 font-medium">{row.term}</th>
                <td className="py-2 pr-4">{row.payment}</td>
                <td className="py-2">{row.interest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        Going from 60 to 84 months lowers the payment by about $165 a month,
        but adds roughly <strong>$2,800</strong> in interest — and in real
        life, longer loans often come with higher interest rates too, which
        widens the gap further.
      </p>

      <h2 className="text-2xl font-bold">The negative equity problem</h2>
      <p>
        Cars lose value quickly, often 20% or more in the first year. With a
        long loan, your balance falls slowly, so for a long stretch you can
        owe more than the car is worth. That&apos;s called being
        &quot;upside down&quot; or having negative equity. If the car is
        totaled or you need to sell it, you may have to cover the difference
        out of pocket, and trading it in often rolls the leftover debt into
        your next loan.
      </p>

      <h2 className="text-2xl font-bold">So what term should you choose?</h2>
      <ul>
        <li>
          <strong>48 months or less</strong> is ideal if the payment fits your
          budget — you&apos;ll pay the least interest and build equity fast.
        </li>
        <li>
          <strong>60 months</strong> is a reasonable middle ground for most
          buyers.
        </li>
        <li>
          <strong>72–84 months</strong> should be a last resort. If you need
          that long to afford the payment, consider a less expensive car.
        </li>
      </ul>
      <p>
        A popular rule of thumb is the <strong>20/4/10 rule</strong>: put at
        least 20% down, finance for no more than 4 years, and keep total car
        costs (payment, insurance, fuel) under 10% of your gross income.
      </p>

      <h2 className="text-2xl font-bold">How to get a lower payment without a longer loan</h2>
      <ul>
        <li>Increase your down payment or wait to save more.</li>
        <li>Get pre-approved by a credit union to compare rates.</li>
        <li>Negotiate the vehicle price, not the monthly payment.</li>
        <li>Skip or pay cash for dealer add-ons instead of financing them.</li>
        <li>Consider a certified pre-owned vehicle.</li>
      </ul>

      <p>
        Want to compare terms with your own numbers, including sales tax,
        fees, and trade-in? Use our{" "}
        <Link href="/calculators/auto-loan">auto loan calculator</Link> and
        view the full amortization schedule.
      </p>
    </GuideArticle>
  );
}
