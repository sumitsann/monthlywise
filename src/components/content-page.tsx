import Link from "next/link";
import type { ReactNode } from "react";

export function ContentPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-medium text-blue-700 hover:underline">
          ← Back to MonthlyWise
        </Link>

        <article className="prose-content mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          {updated && (
            <p className="mt-2 text-sm text-slate-500">
              Last updated: {updated}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </article>
      </div>
    </main>
  );
}

export type Faq = { q: string; a: string };

// Educational write-up shown below each calculator.
export function CalculatorGuide({
  title,
  children,
  faqs,
}: {
  title: string;
  children: ReactNode;
  faqs: Faq[];
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <section className="bg-slate-50 px-4 pb-16 text-slate-900 sm:px-6">
      <article className="prose-content mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        <div className="mt-4">{children}</div>

        <h2 className="mt-10 text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="rounded-xl border border-slate-200 p-4"
            >
              <summary className="cursor-pointer font-semibold">{faq.q}</summary>
              <p className="mt-2">{faq.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-500">
          This guide is for general education and is not financial, tax, or
          legal advice. See our <Link href="/disclaimer">disclaimer</Link>.
        </p>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
