import Breadcrumbs from "@/components/breadcrumbs";
import GuideList from "@/components/guide-list";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Money Guides",
  description:
    "Clear, practical guides on mortgages, car loans, budgeting, credit card debt, and splitting shared expenses.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <main className="bg-slate-50 px-4 pb-16 pt-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={[{ title: "Guides" }]} />

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Money guides
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Plain-English explanations of the money decisions behind our
          calculators, with real examples you can follow.
        </p>

        <div className="mt-10">
          <GuideList />
        </div>
      </div>
    </main>
  );
}
