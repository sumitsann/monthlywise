import Link from "next/link";
import { GuideArticle, guideMetadata } from "@/components/guide-article";

const slug = "how-to-make-a-monthly-budget";

export const metadata = guideMetadata(slug);

export default function Guide() {
  return (
    <GuideArticle slug={slug}>
      <p>
        A budget isn&apos;t about restricting every purchase. It&apos;s a plan
        that tells your money where to go, so you can cover your bills, save
        for goals, and spend on what matters to you without guilt. Here&apos;s
        how to build one in six steps.
      </p>

      <h2 className="text-2xl font-bold">1. Know your take-home income</h2>
      <p>
        Start with the money that actually lands in your bank account each
        month after taxes, retirement contributions, and insurance
        deductions. Include side income, but if it varies, use a conservative
        average or your lowest recent month.
      </p>

      <h2 className="text-2xl font-bold">2. List your fixed expenses</h2>
      <p>
        These are bills that stay about the same every month: rent or
        mortgage, insurance, loan payments, phone, internet, and
        subscriptions. Pull them from your bank statements so nothing is
        missed.
      </p>

      <h2 className="text-2xl font-bold">3. Estimate variable spending</h2>
      <p>
        Groceries, fuel, dining out, and shopping change month to month. Look
        back at the last two or three months of statements and average each
        category. Most people are surprised by at least one number here.
      </p>

      <h2 className="text-2xl font-bold">4. Choose a framework</h2>
      <p>
        The <strong>50/30/20 rule</strong> is a simple place to start:
      </p>
      <ul>
        <li>
          <strong>50% needs</strong> — housing, utilities, groceries,
          insurance, transportation, minimum debt payments.
        </li>
        <li>
          <strong>30% wants</strong> — dining out, entertainment, travel,
          hobbies.
        </li>
        <li>
          <strong>20% savings</strong> — emergency fund, retirement, and extra
          debt payments.
        </li>
      </ul>
      <p>
        On $4,000 of take-home pay, that&apos;s about $2,000 for needs, $1,200
        for wants, and $800 for savings. If you live in a high-cost area,
        needs may take 60% or more — that&apos;s fine, as long as you adjust
        wants rather than skipping savings entirely.
      </p>
      <p>
        Other popular approaches include <strong>zero-based budgeting</strong>,
        where every dollar is assigned a job until income minus expenses equals
        zero, and the <strong>envelope method</strong>, where each spending
        category gets a fixed amount of cash.
      </p>

      <h2 className="text-2xl font-bold">5. Pay yourself first</h2>
      <p>
        Treat savings like a bill. Set up an automatic transfer to savings on
        payday so the money moves before you have a chance to spend it. Even
        $50 a month builds the habit. A common first goal is a starter
        emergency fund of $1,000, growing to three to six months of essential
        expenses.
      </p>

      <h2 className="text-2xl font-bold">6. Review and adjust monthly</h2>
      <p>
        Your first budget won&apos;t be perfect. At the end of each month,
        compare what you planned with what you spent, and adjust categories
        that were unrealistic. Plan ahead for irregular costs like car
        registration, gifts, and annual subscriptions by setting aside a small
        amount each month.
      </p>

      <h2 className="text-2xl font-bold">Common budgeting mistakes</h2>
      <ul>
        <li>Using gross pay instead of take-home pay.</li>
        <li>Forgetting annual or quarterly bills.</li>
        <li>Making the budget so strict that it&apos;s impossible to follow.</li>
        <li>Not leaving any room for fun.</li>
        <li>Giving up after one bad month instead of adjusting.</li>
      </ul>

      <p>
        Ready to try it? Our{" "}
        <Link href="/calculators/budget">household budget calculator</Link>{" "}
        sorts your expenses into needs, wants, and savings and compares them
        to the 50/30/20 rule automatically. If you carry credit card
        balances, read{" "}
        <Link href="/guides/debt-avalanche-vs-snowball">
          avalanche vs. snowball
        </Link>{" "}
        next.
      </p>
    </GuideArticle>
  );
}
