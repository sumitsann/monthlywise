"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Group = {
  id: string;
  name: string;
  createdAt: string;
};

type Member = {
  id: string;
  name: string;
  created_at: string;
};

function getPrivateToken() {
  const fragment = window.location.hash;

  return new URLSearchParams(
    fragment.startsWith("#") ? fragment.slice(1) : fragment,
  ).get("token");
}

function SharedGroupContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [savingMember, setSavingMember] = useState(false);

  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [copied, setCopied] = useState(false);

  const loadMembers = useCallback(
    async (token: string) => {
      setMembersLoading(true);
      setMemberError("");

      try {
        const response = await fetch(
          `/api/groups/${encodeURIComponent(id)}/members`,
          {
            headers: {
              "x-group-token": token,
            },
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load members.");
        }

        setMembers(result.members ?? []);
      } catch (caught) {
        setMemberError(
          caught instanceof Error ? caught.message : "Unable to load members.",
        );
      } finally {
        setMembersLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGroup() {
      setLoading(true);
      setError("");
      setGroup(null);
      setMembers([]);

      try {
        const token = getPrivateToken();

        if (!token) {
          throw new Error("This group requires its complete private link.");
        }

        const response = await fetch(`/api/groups/${encodeURIComponent(id)}`, {
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
          await loadMembers(token);
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
  }, [id, loadMembers]);

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newMemberName.trim();

    if (!name || name.length > 100) {
      setMemberError("Enter a member name between 1 and 100 characters.");
      return;
    }

    const token = getPrivateToken();

    if (!token) {
      setMemberError("The private token is missing from this link.");
      return;
    }

    setSavingMember(true);
    setMemberError("");

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(id)}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-group-token": token,
          },
          body: JSON.stringify({ name }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to add member.");
      }

      setNewMemberName("");

      await loadMembers(token);
    } catch (caught) {
      setMemberError(
        caught instanceof Error ? caught.message : "Unable to add member.",
      );
    } finally {
      setSavingMember(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setError("");
    } catch {
      setError("Unable to copy. Please copy the URL from your address bar.");
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
            Loading your group...
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
              <h2 className="text-2xl font-bold">Group Members</h2>

              <p className="mt-2 text-slate-600">
                Add everyone who will share expenses in this group.
              </p>

              <form
                onSubmit={addMember}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(event) => setNewMemberName(event.target.value)}
                  placeholder="Enter member name"
                  maxLength={100}
                  required
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={savingMember}
                  className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {savingMember ? "Adding..." : "Add Member"}
                </button>
              </form>

              {memberError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {memberError}
                </p>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-slate-800">
                  Members ({members.length})
                </h3>

                {membersLoading ? (
                  <p className="mt-3 text-slate-500">Loading members...</p>
                ) : members.length === 0 ? (
                  <p className="mt-3 text-slate-500">
                    No members yet. Add your first member above.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {members.map((member) => (
                      <li
                        key={member.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {member.name.charAt(0).toUpperCase()}
                        </span>

                        <span className="font-medium">{member.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold">
                Shared Expenses &amp; Settlements
              </h2>

              <p className="mt-3 text-slate-600">
                Next, we&apos;ll add expenses, track who paid, calculate
                balances, and suggest settlements.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function SharedGroupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-12">
          <div className="mx-auto max-w-3xl text-slate-600">
            Loading your shared group...
          </div>
        </main>
      }
    >
      <SharedGroupContent />
    </Suspense>
  );
}
