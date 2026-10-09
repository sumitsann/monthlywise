"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Group = {
  id: string;
  name: string;
  createdAt: string;
};

// This component contains the useParams() hook.
// It must be rendered inside a Suspense boundary.
function SharedGroupContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGroup() {
      setLoading(true);
      setError("");
      setGroup(null);

      try {
        // Read the private token from the URL fragment.
        const fragment = window.location.hash;

        const token = new URLSearchParams(
          fragment.startsWith("#") ? fragment.slice(1) : fragment,
        ).get("token");

        if (!token) {
          throw new Error("This group requires its complete private link.");
        }

        // Send the private token to our protected API.
        const response = await fetch(`/api/groups/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: {
            "x-group-token": token,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to open group.");
        }

        if (!cancelled) {
          setGroup(result as Group);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Unable to open group.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGroup();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);
      setError("");
    } catch {
      setError(
        "Unable to copy the link. Please copy it from your browser address bar.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-medium text-blue-700 hover:underline">
          ← Back to MonthlyWise
        </Link>

        {loading ? (
          <div className="mt-8 rounded-2xl border bg-white p-7">
            <p className="text-slate-600">Loading your group...</p>
          </div>
        ) : error && !group ? (
          <div className="mt-8 rounded-2xl border bg-white p-7">
            <h1 className="text-2xl font-bold">Unable to Open Group</h1>

            <p role="alert" className="mt-3 text-red-700">
              {error}
            </p>

            <Link
              href="/groups/new"
              className="mt-5 inline-block font-medium text-blue-700 hover:underline"
            >
              Create a new group
            </Link>
          </div>
        ) : group ? (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-blue-700">
                Private Shared Group
              </p>

              <h1 className="mt-2 text-3xl font-bold">{group.name}</h1>

              <p className="mt-3 text-sm text-slate-500">
                Created {new Date(group.createdAt).toLocaleDateString()}
              </p>

              <button
                type="button"
                onClick={copyLink}
                className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                {copied ? "Link Copied!" : "Copy Private Group Link"}
              </button>

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <p className="mt-3 text-xs text-slate-500">
                Anyone with this link can access the group. Keep it private.
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold">
                Group Members &amp; Expenses
              </h2>

              <p className="mt-3 text-slate-600">
                Your group is saved in Supabase and can be opened using its
                private link.
              </p>

              <p className="mt-3 text-slate-600">
                Next, we&apos;ll connect member management, shared expenses,
                balances, and settlements.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

// This is the actual Next.js page.
// Suspense allows Next.js 16 to handle useParams()
// without blocking prerendering.
export default function SharedGroupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border bg-white p-7 shadow-sm">
              <p className="text-slate-600">Loading your shared group...</p>
            </div>
          </div>
        </main>
      }
    >
      <SharedGroupContent />
    </Suspense>
  );
}
