import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorGuide } from "@/components/content-page";
import CreditCardCalculator from "./calculator";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator (Avalanche & Snowball)",
  description:
    "Free credit card payoff calculator. See how long it will take to pay off your balance, how much interest you'll pay, and compare the avalanche and snowball methods across multiple cards.",
  alternates: { canonical: "/calculators/credit-card" },
};

const faqs = [
  {
    q: "How is credit card interest calculated?",
    a: "Card issuers convert your APR to a daily or monthly rate and charge interest on your balance. Roughly, monthly interest equals your balance times APR divided by 12. If you carry a balance, that interest is added each month, which is why balances can grow even while you make payments.",
  },
  {
    q: "What is the avalanche method?",
    a: "With the avalanche method, you make minimum payments on every card and put any extra money toward the card with the highest APR. It minimizes the total interest you pay.",
  },
  {
    q: "What is the snowball method?",
    a: "With the snowball method, you put extra money toward the smallest balance first. You pay slightly more interest than with the avalanche method, but clearing cards quickly can keep you motivated.",
  },
  {
    q: "Why does paying only the minimum take so long?",
    a: "Minimum payments are often just interest plus a small percentage of the balance. Most of the payment goes to interest, so the balance shrinks very slowly. Paying even a little more than the minimum can cut years off your payoff time.",
  },
  {
    q: "Does a 0% balance transfer help?",
    a: "It can. A promotional 0% APR lets your whole payment reduce principal. Watch for balance transfer fees and make sure you can pay the balance off before the promotional period ends and the regular APR applies.",
  },
];

export default function CreditCardPage() {
  return (
    <>
      <CreditCardCalculator />
      <CalculatorGuide
        title="How to use the credit card payoff calculator"
        faqs={faqs}
      >
        <p>
          For a single card, enter your current balance, APR, and the amount
          you plan to pay each month. The calculator shows how many months it
          will take to reach a zero balance, the total interest you will pay,
          and a month-by-month payoff schedule. You can also model a
          promotional APR, such as a 0% balance transfer offer, and see what
          happens when it ends.
        </p>
        <p>
          Have more than one card? Add each card with its balance, APR, and
          minimum payment, set your total monthly debt budget, and choose the{" "}
          <strong>avalanche</strong> or <strong>snowball</strong> strategy to
          compare payoff plans.
        </p>

        <h3>Example: paying a little extra</h3>
        <p>
          A $5,000 balance at 22% APR with a $200 monthly payment takes about{" "}
          <strong>34 months</strong> to pay off and costs roughly $1,750 in
          interest. Raising the payment to $300 cuts payoff time to about{" "}
          <strong>21 months</strong> and interest to around $1,020, saving
          over $700 and more than a year of payments.
        </p>

        <h3>Avalanche vs. snowball</h3>
        <ul>
          <li>
            <strong>Avalanche</strong> targets the highest interest rate first.
            It is mathematically the cheapest way to pay off debt.
          </li>
          <li>
            <strong>Snowball</strong> targets the smallest balance first. Each
            card you eliminate frees up its payment for the next one, which
            builds momentum.
          </li>
        </ul>
        <p>
          The best strategy is the one you will stick with. Run both in the
          calculator to see the actual difference in time and interest for
          your cards.
        </p>

        <h3>Ways to pay off credit cards faster</h3>
        <ul>
          <li>Pay more than the minimum every month, even by a small amount.</li>
          <li>Stop adding new charges to the cards you are paying down.</li>
          <li>Ask your card issuer for a lower APR.</li>
          <li>Consider a balance transfer or a lower-rate consolidation loan.</li>
          <li>
            Find extra money in your monthly spending with a{" "}
            <Link href="/calculators/budget">budget calculator</Link>.
          </li>
        </ul>
      </CalculatorGuide>
    </>
  );
}
