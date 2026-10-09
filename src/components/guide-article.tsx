import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import { formatDate, getGuide, guides } from "@/lib/guides";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function guideMetadata(slug: string): Metadata {
  const guide = getGuide(slug);
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${slug}`,
    type: "article",
    publishedTime: guide.published,
  });
}

export function GuideArticle({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const guide = getGuide(slug);
  const related = guides.filter((item) => item.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.published,
    image: `${SITE_URL}/opengraph-image`,
    author: {
      "@type": "Organization",
      name: `${SITE_NAME} Editorial Team`,
      url: `${SITE_URL}/about`,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/guides/${slug}`,
  };

  return (
    <main className="bg-slate-50 px-4 pb-16 pt-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          items={[{ title: "Guides", href: "/guides" }, { title: guide.title }]}
        />

        <article className="prose-content mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="!mt-0 text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            {guide.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          <p className="!mt-3 text-sm text-slate-600">
            By the {SITE_NAME} Editorial Team ·{" "}
            <time dateTime={guide.published}>
              {formatDate(guide.published)}
            </time>{" "}
            · {guide.readMinutes} min read
          </p>

          <div className="mt-6 text-[17px]">{children}</div>

          <aside className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-slate-800">
            <p className="!mt-0 font-semibold text-slate-900 dark:text-white">
              Run your own numbers
            </p>
            <p className="!mt-1">
              Try the free {guide.calculator.title} to see what this means for
              your situation.
            </p>
            <Link
              href={guide.calculator.href}
              className="mt-3 inline-block rounded-lg bg-blue-700 px-4 py-2 font-semibold !text-white !no-underline hover:bg-blue-800"
            >
              Open {guide.calculator.title}
            </Link>
          </aside>

          <p className="mt-8 text-xs text-slate-600">
            This article is for general education and is not financial advice.
            See our <Link href="/disclaimer">disclaimer</Link>.
          </p>
        </article>

        <section aria-labelledby="related-guides" className="mt-10">
          <h2 id="related-guides" className="text-xl font-bold">
            More guides
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/guides/${item.slug}`}
                  className="block h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:hover:border-blue-500"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    {item.category}
                  </span>
                  <span className="mt-1 block font-semibold leading-snug">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <JsonLd data={jsonLd} />
    </main>
  );
}
