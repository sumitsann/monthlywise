import Link from "next/link";
import { guides } from "@/lib/guides";

export default function GuideList({ limit }: { limit?: number }) {
  const items = limit ? guides.slice(0, limit) : guides;

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((guide) => (
        <li key={guide.slug}>
          <Link
            href={`/guides/${guide.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg motion-reduce:hover:translate-y-0 dark:hover:border-blue-500"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              {guide.category}
            </span>
            <span className="mt-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
              {guide.title}
            </span>
            <span className="mt-2 flex-1 text-[15px] leading-6 text-slate-600">
              {guide.description}
            </span>
            <span className="mt-4 text-sm font-medium text-slate-600">
              {guide.readMinutes} min read
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
