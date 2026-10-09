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

type Expense = {
  id: string;
  description: string;
  amount_cents: number;
  paid_by: string;
  created_at: string;
};

type MemberBalance = {
  memberId: string;
  name: string;
  paidCents: number;
  owedCents: number;
  balanceCents: number;
};

type Settlement = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountCents: number;
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

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

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("");

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [savingMember, setSavingMember] = useState(false);

  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [copied, setCopied] = useState(false);

  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalExpensesCents, setTotalExpensesCents] = useState(0);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");

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

  const loadExpenses = useCallback(
    async (token: string) => {
      setExpensesLoading(true);
      setExpenseError("");

      try {
        const response = await fetch(
          `/api/groups/${encodeURIComponent(id)}/expenses`,
          {
            headers: {
              "x-group-token": token,
            },
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load expenses.");
        }

        setExpenses(result.expenses ?? []);
      } catch (caught) {
        setExpenseError(
          caught instanceof Error ? caught.message : "Unable to load expenses.",
        );
      } finally {
        setExpensesLoading(false);
      }
    },
    [id],
  );

  const loadBalances = useCallback(
    async (token: string) => {
      setBalancesLoading(true);
      setBalanceError("");

      try {
        const response = await fetch(
          `/api/groups/${encodeURIComponent(id)}/balances`,
          {
            headers: {
              "x-group-token": token,
            },
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to calculate balances.");
        }

        setBalances(result.balances ?? []);
        setSettlements(result.settlements ?? []);
        setTotalExpensesCents(result.totalExpensesCents ?? 0);
      } catch (caught) {
        setBalanceError(
          caught instanceof Error
            ? caught.message
            : "Unable to calculate balances.",
        );
      } finally {
        setBalancesLoading(false);
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
          await loadExpenses(token);
          await loadBalances(token);
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
  }, [id, loadMembers, loadExpenses, loadBalances]);

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
      await loadBalances(token);
    } catch (caught) {
      setMemberError(
        caught instanceof Error ? caught.message : "Unable to add member.",
      );
    } finally {
      setSavingMember(false);
    }
  }

  async function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const description = expenseDescription.trim();
    const amountText = expenseAmount.trim();

    if (!description || description.length > 200) {
      setExpenseError("Enter a description between 1 and 200 characters.");
      return;
    }

    // Accept dollars with up to two decimal places.
    if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {
      setExpenseError("Enter an amount such as 25 or 25.50.");
      return;
    }

    const [dollars, cents = ""] = amountText.split(".");

    const amountCents = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));

    if (
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0 ||
      amountCents > 100000000000
    ) {
      setExpenseError("Enter a valid expense amount.");
      return;
    }

    if (!expensePaidBy) {
      setExpenseError("Select who paid.");
      return;
    }

    const token = getPrivateToken();

    if (!token) {
      setExpenseError("The private token is missing from this link.");
      return;
    }

    setSavingExpense(true);
    setExpenseError("");

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(id)}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-group-token": token,
          },
          body: JSON.stringify({
            description,
            amountCents,
            paidBy: expensePaidBy,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save expense.");
      }

      setExpenseDescription("");
      setExpenseAmount("");

      await loadExpenses(token);
      await loadBalances(token);
    } catch (caught) {
      setExpenseError(
        caught instanceof Error ? caught.message : "Unable to save expense.",
      );
    } finally {
      setSavingExpense(false);
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
              <h2 className="text-2xl font-bold">Shared Expenses</h2>

              <p className="mt-2 text-slate-600">
                Record an expense and split it equally among all current group
                members.
              </p>

              <form onSubmit={addExpense} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Expense description
                  </span>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(event) =>
                      setExpenseDescription(event.target.value)
                    }
                    placeholder="Example: Hotel booking"
                    maxLength={200}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Amount ($)
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={expenseAmount}
                      onChange={(event) => setExpenseAmount(event.target.value)}
                      placeholder="300.00"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Paid by
                    </span>
                    <select
                      value={expensePaidBy}
                      onChange={(event) => setExpensePaidBy(event.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                    >
                      <option value="">Select member</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingExpense || members.length === 0}
                  className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {savingExpense ? "Saving expense..." : "Add Expense"}
                </button>
              </form>

              {expenseError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {expenseError}
                </p>
              )}

              <div className="mt-8">
                <h3 className="text-lg font-bold">
                  Recorded Expenses ({expenses.length})
                </h3>

                {expensesLoading ? (
                  <p className="mt-3 text-slate-500">Loading expenses...</p>
                ) : expenses.length === 0 ? (
                  <p className="mt-3 text-slate-500">
                    No expenses recorded yet.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {expenses.map((expense) => {
                      const payer = members.find(
                        (member) => member.id === expense.paid_by,
                      );

                      return (
                        <li
                          key={expense.id}
                          className="flex items-start justify-between gap-4 p-4"
                        >
                          <div>
                            <p className="font-semibold">
                              {expense.description}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Paid by {payer?.name ?? "Unknown member"}
                            </p>
                          </div>

                          <p className="whitespace-nowrap font-bold">
                            {formatMoney(expense.amount_cents)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold">Balances &amp; Settlements</h2>

              <p className="mt-2 text-slate-600">
                See who should receive money and who owes money.
              </p>

              {balanceError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {balanceError}
                </p>
              )}

              {balancesLoading ? (
                <p className="mt-5 text-slate-500">Calculating balances...</p>
              ) : (
                <>
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Total Group Expenses
                    </p>
                    <p className="mt-1 text-3xl font-bold">
                      {formatMoney(totalExpensesCents)}
                    </p>
                  </div>

                  <h3 className="mt-7 text-lg font-bold">Member Balances</h3>

                  {balances.length === 0 ? (
                    <p className="mt-3 text-slate-500">
                      Add members to see balances.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {balances.map((balance) => (
                        <div
                          key={balance.memberId}
                          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                        >
                          <div>
                            <p className="font-semibold">{balance.name}</p>

                            <p className="mt-1 text-xs text-slate-500">
                              Paid {formatMoney(balance.paidCents)}
                              {" · "}
                              Share {formatMoney(balance.owedCents)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                balance.balanceCents > 0
                                  ? "text-green-700"
                                  : balance.balanceCents < 0
                                    ? "text-red-700"
                                    : "text-slate-700"
                              }`}
                            >
                              {balance.balanceCents > 0 ? "+" : ""}
                              {formatMoney(balance.balanceCents)}
                            </p>

                            <p className="text-xs text-slate-500">
                              {balance.balanceCents > 0
                                ? "Gets back"
                                : balance.balanceCents < 0
                                  ? "Owes"
                                  : "Settled"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 className="mt-8 text-lg font-bold">
                    Suggested Settlements
                  </h3>

                  {settlements.length === 0 ? (
                    <p className="mt-3 text-slate-500">
                      No payments needed right now.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {settlements.map((settlement, index) => (
                        <li
                          key={`${settlement.fromId}-${settlement.toId}-${index}`}
                          className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-slate-900">
                              {settlement.fromName}
                              {" → "}
                              {settlement.toName}
                            </p>

                            <p className="font-bold text-blue-800">
                              {formatMoney(settlement.amountCents)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-5 text-xs text-slate-500">
                    These are suggested payments only. No money is transferred
                    automatically.
                  </p>
                </>
              )}
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
