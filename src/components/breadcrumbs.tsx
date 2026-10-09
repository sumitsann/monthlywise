import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/lib/seo";

export type Crumb = { title: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ title: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.title,
      ...(crumb.href && { item: `${SITE_URL}${crumb.href}` }),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-slate-600 dark:text-slate-300">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={crumb.title} className="flex items-center gap-1.5">
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="rounded hover:text-blue-700 hover:underline dark:hover:text-blue-300"
                >
                  {crumb.title}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="font-medium text-slate-900 dark:text-white"
                >
                  {crumb.title}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={jsonLd} />
    </nav>
  );
}
