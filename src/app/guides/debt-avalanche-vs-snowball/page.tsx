import Link from "next/link";
import { GuideArticle, guideMetadata } from "@/components/guide-article";

const slug = "debt-avalanche-vs-snowball";

export const metadata = guideMetadata(slug);

export default function Guide() {
  return (
    <GuideArticle slug={slug}>
      <p>
        If you have balances on more than one credit card, the order in which
        you pay them off matters. The two most popular strategies are the{" "}
        <strong>debt avalanche</strong> and the <strong>debt snowball</strong>.
        Both work — the best one depends on whether you want to save the most
        money or stay the most motivated.
      </p>

      <h2 className="text-2xl font-bold">How both methods start</h2>
      <p>The first steps are the same for either method:</p>
      <ol>
        <li>List every debt with its balance, interest rate (APR), and minimum payment.</li>
        <li>Decide on a total amount you can put toward debt each month.</li>
        <li>Pay the minimum on every account so nothing goes delinquent.</li>
        <li>Send every extra dollar to one &quot;target&quot; debt.</li>
        <li>
          When the target is paid off, roll its whole payment into the next
          target. Your payment grows each time, like a snowball rolling
          downhill.
        </li>
      </ol>
      <p>The only difference is how you choose the target.</p>

      <h2 className="text-2xl font-bold">The avalanche method</h2>
      <p>
        With the avalanche, you target the debt with the{" "}
        <strong>highest interest rate</strong> first. Because the most
        expensive debt disappears first, you pay the least total interest and
        usually finish sooner. It is the mathematically optimal choice.
      </p>
      <p>
        The downside: if your highest-rate card also has a large balance, it
        may be months before you see any debt fully paid off, which can feel
        discouraging.
      </p>

      <h2 className="text-2xl font-bold">The snowball method</h2>
      <p>
        With the snowball, you target the <strong>smallest balance</strong>{" "}
        first, regardless of rate. You pay a bit more interest than with the
        avalanche, but you get quick wins. Research on consumer behavior
        suggests those early successes help many people stick with their plan.
      </p>

      <h2 className="text-2xl font-bold">Example</h2>
      <p>Imagine two cards and a $400 monthly debt budget:</p>
      <ul>
        <li>Card A: $1,000 balance at 18% APR, $35 minimum</li>
        <li>Card B: $4,000 balance at 24% APR, $100 minimum</li>
      </ul>
      <p>
        <strong>Snowball</strong> targets Card A. After paying Card B&apos;s
        $100 minimum, $300 a month goes to Card A, which is gone in about four
        months. Then the full $400 goes to Card B.
      </p>
      <p>
        <strong>Avalanche</strong> targets Card B because its 24% rate is
        higher. Card A gets only its minimum until Card B is paid off. This
        saves interest overall, but your first paid-off card comes much later.
      </p>
      <p>
        You can enter your own cards in our{" "}
        <Link href="/calculators/credit-card">credit card payoff calculator</Link>{" "}
        and switch between the two strategies to see the exact difference in
        months and dollars.
      </p>

      <h2 className="text-2xl font-bold">Which one should you choose?</h2>
      <ul>
        <li>
          <strong>Choose avalanche</strong> if your interest rates differ a
          lot, you are motivated by numbers, or your balances are similar in
          size.
        </li>
        <li>
          <strong>Choose snowball</strong> if you have several small balances,
          you have struggled to stay on a plan before, or you want fewer bills
          to track quickly.
        </li>
      </ul>
      <p>
        The difference in interest is often smaller than people expect. The
        biggest factor is consistency: picking a plan and paying more than the
        minimum every month.
      </p>

      <h2 className="text-2xl font-bold">Tips to speed things up</h2>
      <ul>
        <li>Stop using the cards while you pay them down.</li>
        <li>Call your issuer and ask for a lower APR.</li>
        <li>Look at 0% balance transfer offers, and watch the transfer fee.</li>
        <li>
          Put windfalls like tax refunds or bonuses toward your target debt.
        </li>
        <li>
          Find extra room in your spending with a{" "}
          <Link href="/guides/how-to-make-a-monthly-budget">monthly budget</Link>.
        </li>
      </ul>
    </GuideArticle>
  );
}
