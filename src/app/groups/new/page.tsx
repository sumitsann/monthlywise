"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GROUP_LINK_LIFETIME_DAYS } from "@/lib/group-link";

export default function NewGroupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const groupName = name.trim();

    if (!groupName) {
      setError("Please enter a group name.");
      return;
    }

    if (groupName.length > 100) {
      setError("Group name must be 100 characters or fewer.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: groupName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create group.");
      }

      // Put the private token in the URL fragment.
      // URL fragments are not sent to the server in HTTP requests.
      const destination =
        `/groups/${encodeURIComponent(result.id)}` +
        `#token=${encodeURIComponent(result.token)}`;

      router.push(destination);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-xl">

        <div className="rounded-2xl border bg-white p-7 shadow-sm">
          <h1 className="text-3xl font-bold">Create Shared Expense Group</h1>

          <p className="mt-3 text-slate-600">
            Start a private group for trips, roommates, family expenses, or
            shared purchases.
          </p>

          <form onSubmit={createGroup} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Group name
              </span>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Summer Vacation"
                maxLength={100}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Creating group..." : "Create Private Group"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            Anyone who receives your private group link will be able to access
            the group. Only share it with people you trust.
          </p>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Group links are available for {GROUP_LINK_LIFETIME_DAYS} days.
            After that, the group and its expenses can no longer be opened, so
            settle up before the link expires.
          </p>
        </div>
      </div>
    </main>
  );
}
