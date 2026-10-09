import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { calculators } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "MonthlyWise builds free, simple financial calculators that help people understand monthly payments, budgets, and shared expenses.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage title="About MonthlyWise">
      <p>
        MonthlyWise is a free collection of financial calculators built to
        answer one everyday question: <strong>what will this cost me each
        month?</strong> Whether you are shopping for a home, comparing car
        loans, paying down a credit card, or splitting rent with roommates, we
        want the math to be clear, quick, and free.
      </p>

      <h2 className="text-2xl font-bold">Why we built it</h2>
      <p>
        Many financial calculators online are cluttered, ask for your email
        before showing results, or hide the details that matter, like how much
        of each payment goes to interest. MonthlyWise takes a different
        approach:
      </p>
      <ul>
        <li>
          <strong>No sign-up required.</strong> Every calculator works
          instantly in your browser.
        </li>
        <li>
          <strong>Your numbers stay private.</strong> Calculator inputs are
          processed on your device and never sent to our servers.
        </li>
        <li>
          <strong>Transparent math.</strong> We show amortization schedules,
          total interest, and the formulas behind the results, and each tool
          includes a plain-English guide.
        </li>
        <li>
          <strong>Works everywhere.</strong> Designed for phones, tablets, and
          desktops, with light and dark modes.
        </li>
      </ul>

      <h2 className="text-2xl font-bold">Our tools</h2>
      <ul>
        {calculators.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.title}</Link>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold">How we keep things accurate</h2>
      <p>
        Our loan calculators use the standard amortization formula used by
        lenders in the United States, and our credit card calculator models
        interest month by month. We review our calculators when we add
        features and correct issues as soon as they are reported. Results are
        estimates, so please read our <Link href="/disclaimer">disclaimer</Link>{" "}
        and confirm details with your lender.
      </p>

      <h2 className="text-2xl font-bold">How MonthlyWise is funded</h2>
      <p>
        MonthlyWise is free to use and is supported by advertising. Ads never
        change the results of our calculators.
      </p>

      <h2 className="text-2xl font-bold">Get in touch</h2>
      <p>
        Have feedback, found a bug, or want to suggest a new calculator?{" "}
        <Link href="/contact">Contact us</Link> — we read every message.
      </p>
    </ContentPage>
  );
}
