import Link from "next/link";
import { GuideArticle, guideMetadata } from "@/components/guide-article";

const slug = "how-to-split-expenses-with-roommates";

export const metadata = guideMetadata(slug);

export default function Guide() {
  return (
    <GuideArticle slug={slug}>
      <p>
        Money is one of the most common sources of tension between roommates
        and couples. The good news is that most arguments can be avoided with
        a clear agreement up front and a simple way to track who paid for
        what.
      </p>

      <h2 className="text-2xl font-bold">Three fair ways to split rent</h2>
      <h3>1. Split evenly</h3>
      <p>
        Everyone pays the same share. This is simplest and works well when
        bedrooms are similar in size and everyone shares common spaces
        equally.
      </p>

      <h3>2. Split by room size or features</h3>
      <p>
        If one bedroom is larger, has a private bathroom, or includes a
        parking space, that person pays more. One approach: split half of
        the rent evenly (for shared spaces) and divide the other half by
        each bedroom&apos;s square footage.
      </p>
      <p>
        For example, with $2,400 rent and two roommates, $1,200 is split
        evenly ($600 each). If bedroom A is 180 sq ft and bedroom B is 120 sq
        ft, bedroom A covers 60% of the remaining $1,200 ($720) and bedroom B
        covers 40% ($480). Total: <strong>$1,320</strong> and{" "}
        <strong>$1,080</strong>.
      </p>

      <h3>3. Split by income</h3>
      <p>
        Common for couples: each person pays a share proportional to their
        income. If one partner earns $60,000 and the other $40,000, they
        might split shared costs 60/40.
      </p>

      <h2 className="text-2xl font-bold">Utilities and groceries</h2>
      <ul>
        <li>
          <strong>Utilities</strong> (electricity, internet, water) are
          usually split evenly. If one person works from home and runs the AC
          all day, consider adjusting.
        </li>
        <li>
          <strong>Groceries</strong>: decide whether you&apos;ll share
          staples (oil, spices, cleaning supplies) and buy personal food
          separately, or pool everything.
        </li>
        <li>
          <strong>Streaming and subscriptions</strong>: only split the ones
          everyone uses.
        </li>
      </ul>

      <h2 className="text-2xl font-bold">Put it in writing</h2>
      <p>
        A short roommate agreement covering rent shares, bill due dates, how
        shared purchases work, and what happens if someone moves out early
        prevents misunderstandings later. It doesn&apos;t need to be formal —
        a shared note everyone agrees to is enough.
      </p>

      <h2 className="text-2xl font-bold">Track expenses as they happen</h2>
      <p>
        The biggest source of conflict is usually not the split itself but
        losing track of who paid for what. Record every shared expense as it
        happens, then settle up on a regular schedule, such as monthly.
        Instead of everyone paying everyone back, calculate net balances so
        the fewest payments clear all debts.
      </p>
      <p>
        Our free <Link href="/groups/new">Split Expenses</Link> tool does
        this for you: create a group, share the link with your roommates, add
        expenses as they happen, and see exactly who owes whom.
      </p>

      <h2 className="text-2xl font-bold">Tips for keeping the peace</h2>
      <ul>
        <li>Agree on the rules before the first bill arrives.</li>
        <li>Settle up on a regular schedule rather than letting balances grow.</li>
        <li>Keep receipts or photos for larger shared purchases.</li>
        <li>Talk early if someone is having trouble paying their share.</li>
        <li>
          Fit your share into your own{" "}
          <Link href="/guides/how-to-make-a-monthly-budget">monthly budget</Link>.
        </li>
      </ul>
    </GuideArticle>
  );
}
