import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorGuide } from "@/components/content-page";
import BudgetCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Household Budget Calculator (50/30/20 Rule)",
  description:
    "Free monthly budget calculator. Track income and expenses, see your needs, wants, and savings split, and check your budget against the 50/30/20 rule.",
  alternates: { canonical: "/calculators/budget" },
};

const faqs = [
  {
    q: "What is the 50/30/20 budget rule?",
    a: "The 50/30/20 rule suggests spending about 50% of your take-home pay on needs, 30% on wants, and 20% on savings and extra debt payments. It is a simple starting point that you can adjust to your situation.",
  },
  {
    q: "Should I budget with gross or take-home pay?",
    a: "Use take-home pay, the amount that actually reaches your bank account after taxes and deductions. That is the money you have available to spend and save each month.",
  },
  {
    q: "How big should my emergency fund be?",
    a: "A common goal is three to six months of essential expenses. If your income is irregular or you are the only earner in your household, aiming for the higher end can provide extra security.",
  },
  {
    q: "What counts as a need versus a want?",
    a: "Needs are expenses you must pay to live and work, such as housing, utilities, groceries, insurance, transportation, and minimum debt payments. Wants are things you choose, like dining out, entertainment, subscriptions, and shopping.",
  },
];

export default function BudgetPage() {
  return (
    <>
      <BudgetCalculator />
      <CalculatorGuide title="How to use the budget calculator" faqs={faqs}>
        <p>
          Add each source of monthly take-home income, then list your
          expenses and assign each one to <strong>Needs</strong>,{" "}
          <strong>Wants</strong>, or <strong>Savings</strong>. The calculator
          totals everything, shows how much income is left unallocated, and
          compares your spending to the popular 50/30/20 guideline so you can
          quickly spot where your money is going.
        </p>

        <h3>The 50/30/20 rule explained</h3>
        <ul>
          <li>
            <strong>50% needs:</strong> rent or mortgage, utilities,
            groceries, insurance, transportation, and minimum debt payments.
          </li>
          <li>
            <strong>30% wants:</strong> dining out, entertainment, shopping,
            travel, and subscriptions.
          </li>
          <li>
            <strong>20% savings:</strong> emergency fund, retirement
            contributions, and extra payments toward debt.
          </li>
        </ul>

        <h3>Example</h3>
        <p>
          With $4,000 in monthly take-home pay, the 50/30/20 rule suggests
          about <strong>$2,000</strong> for needs, <strong>$1,200</strong>{" "}
          for wants, and <strong>$800</strong> for savings and debt payoff. If
          your rent alone is $1,800, your needs will likely exceed 50%, which
          is common in high-cost areas. In that case, trimming wants or
          finding ways to lower fixed costs helps protect your savings goal.
        </p>

        <h3>Steps to build a budget that works</h3>
        <ol>
          <li>
            <strong>Track one month of spending</strong> using bank and card
            statements so your numbers are realistic.
          </li>
          <li>
            <strong>Pay yourself first</strong> by treating savings as a fixed
            expense rather than whatever is left over.
          </li>
          <li>
            <strong>Plan for irregular costs</strong> such as car repairs,
            gifts, and annual subscriptions by setting aside a little each
            month.
          </li>
          <li>
            <strong>Review monthly</strong> and adjust. A budget is a plan you
            update as life changes.
          </li>
        </ol>
        <p>
          Sharing costs with roommates or a partner? Use{" "}
          <Link href="/groups/new">Split Expenses</Link> to track who owes
          what. Carrying card balances? See your payoff timeline with the{" "}
          <Link href="/calculators/credit-card">credit card payoff calculator</Link>
          .
        </p>
      </CalculatorGuide>
    </>
  );
}
