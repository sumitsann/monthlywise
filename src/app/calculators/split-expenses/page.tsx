"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Member = {
  id: number;
  name: string;
};

type Expense = {
  id: number;
  description: string;
  amountCents: number;
  paidBy: number;
  shares: Record<number, number>;
};

type Settlement = {
  from: string;
  to: string;
  amountCents: number;
};

const dollars = (cents: number) =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const toCents = (value: string) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100)) : 0;
};

function splitEqually(
  amountCents: number,
  memberIds: number[],
): Record<number, number> {
  if (memberIds.length === 0) return {};

  const base = Math.floor(amountCents / memberIds.length);
  let remainder = amountCents % memberIds.length;

  const shares: Record<number, number> = {};

  for (const id of memberIds) {
    shares[id] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  }

  return shares;
}

export default function SplitExpensesPage() {
  const [groupName, setGroupName] = useState("Weekend Trip");

  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "Alex" },
    { id: 2, name: "Jordan" },
    { id: 3, name: "Taylor" },
  ]);

  const [newMember, setNewMember] = useState("");
  const [nextMemberId, setNextMemberId] = useState(4);

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [paidBy, setPaidBy] = useState(1);

  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");

  const [selectedMembers, setSelectedMembers] = useState<number[]>([1, 2, 3]);

  const [customShares, setCustomShares] = useState<Record<number, string>>({});

  const [error, setError] = useState("");

  const results = useMemo(() => {
    const balances: Record<number, number> = {};

    for (const member of members) {
      balances[member.id] = 0;
    }

    let totalSpent = 0;

    for (const expense of expenses) {
      totalSpent += expense.amountCents;

      if (balances[expense.paidBy] !== undefined) {
        balances[expense.paidBy] += expense.amountCents;
      }

      for (const [id, share] of Object.entries(expense.shares)) {
        const memberId = Number(id);

        if (balances[memberId] !== undefined) {
          balances[memberId] -= share;
        }
      }
    }

    const creditors = members
      .filter((member) => balances[member.id] > 0)
      .map((member) => ({
        name: member.name,
        amount: balances[member.id],
      }))
      .sort((a, b) => b.amount - a.amount);

    const debtors = members
      .filter((member) => balances[member.id] < 0)
      .map((member) => ({
        name: member.name,
        amount: -balances[member.id],
      }))
      .sort((a, b) => b.amount - a.amount);

    const settlements: Settlement[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const amountCents = Math.min(debtors[i].amount, creditors[j].amount);

      if (amountCents > 0) {
        settlements.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amountCents,
        });
      }

      debtors[i].amount -= amountCents;
      creditors[j].amount -= amountCents;

      if (debtors[i].amount === 0) i++;
      if (creditors[j].amount === 0) j++;
    }

    return {
      balances,
      settlements,
      totalSpent,
    };
  }, [members, expenses]);

  function addMember() {
    const name = newMember.trim();

    if (!name) return;

    if (
      members.some((member) => member.name.toLowerCase() === name.toLowerCase())
    ) {
      setError("Member names must be unique.");
      return;
    }

    const id = nextMemberId;

    setMembers((current) => [...current, { id, name }]);
    setSelectedMembers((current) => [...current, id]);
    setNextMemberId((current) => current + 1);
    setNewMember("");
    setError("");
  }

  function removeMember(id: number) {
    if (
      expenses.some(
        (expense) => expense.paidBy === id || expense.shares[id] !== undefined,
      )
    ) {
      setError(
        "This member is part of an existing expense. Delete those expenses first.",
      );
      return;
    }

    setMembers((current) => current.filter((member) => member.id !== id));

    setSelectedMembers((current) =>
      current.filter((memberId) => memberId !== id),
    );

    if (paidBy === id) {
      setPaidBy(members.find((member) => member.id !== id)?.id ?? 0);
    }

    setError("");
  }

  function addExpense() {
    setError("");

    const amountCents = toCents(amount);

    if (!description.trim()) {
      setError("Enter an expense description.");
      return;
    }

    if (amountCents <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (!members.some((member) => member.id === paidBy)) {
      setError("Choose who paid for this expense.");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Select at least one person to split the expense.");
      return;
    }

    let shares: Record<number, number>;

    if (splitMode === "equal") {
      shares = splitEqually(amountCents, selectedMembers);
    } else {
      shares = {};

      for (const id of selectedMembers) {
        shares[id] = toCents(customShares[id] ?? "0");
      }

      const totalShares = Object.values(shares).reduce(
        (sum, share) => sum + share,
        0,
      );

      if (totalShares !== amountCents) {
        setError(
          `Custom shares must total ${dollars(amountCents)}. ` +
            `Current total: ${dollars(totalShares)}.`,
        );
        return;
      }
    }

    setExpenses((current) => [
      ...current,
      {
        id: Date.now(),
        description: description.trim(),
        amountCents,
        paidBy,
        shares,
      },
    ]);

    setDescription("");
    setAmount("0");
    setCustomShares({});
  }

  const memberName = (id: number) =>
    members.find((member) => member.id === id)?.name ?? "Unknown";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-medium text-blue-700 hover:underline">
          ← Back to MonthlyWise
        </Link>

        <h1 className="mt-7 text-3xl font-bold sm:text-4xl">Split Expenses</h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          Track shared expenses, split costs among friends, and see who owes
          whom.
        </p>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This is a local calculator preview. Your group and expenses are not
          saved yet, and sharing a URL will not share this data. Database-backed
          groups come next.
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Group Details</h2>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Group name
                </span>
                <input
                  type="text"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <h3 className="font-semibold">Members</h3>

              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                  >
                    <span>{member.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMember}
                  onChange={(event) => setNewMember(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addMember();
                  }}
                  placeholder="New member name"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
                >
                  Add
                </button>
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Add Expense</h2>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Description
                </span>
                <input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Dinner, groceries, hotel..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Amount ($)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Paid by</span>
                <select
                  value={paidBy}
                  onChange={(event) => setPaidBy(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="mb-2 text-sm font-medium">Split between</p>

                <div className="space-y-2">
                  {members.map((member) => (
                    <label key={member.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={(event) =>
                          setSelectedMembers((current) =>
                            event.target.checked
                              ? [...current, member.id]
                              : current.filter((id) => id !== member.id),
                          )
                        }
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Split method
                </span>
                <select
                  value={splitMode}
                  onChange={(event) =>
                    setSplitMode(event.target.value as "equal" | "custom")
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="equal">Split equally</option>
                  <option value="custom">Custom dollar amounts</option>
                </select>
              </label>

              {splitMode === "custom" && (
                <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium">
                    Enter each person&apos;s share
                  </p>

                  {members
                    .filter((member) => selectedMembers.includes(member.id))
                    .map((member) => (
                      <label key={member.id} className="block">
                        <span className="mb-1 block text-sm">
                          {member.name} ($)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customShares[member.id] ?? ""}
                          onChange={(event) =>
                            setCustomShares((current) => ({
                              ...current,
                              [member.id]: event.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                    ))}
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={addExpense}
                className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Add Expense
              </button>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                {groupName || "Group"} Summary
              </h2>

              <p className="mt-5 text-sm text-slate-500">
                Total group spending
              </p>

              <p className="mt-1 text-4xl font-extrabold text-blue-700">
                {dollars(results.totalSpent)}
              </p>

              <h3 className="mt-7 font-bold">Member Balances</h3>

              <div className="mt-3 space-y-3">
                {members.map((member) => {
                  const balance = results.balances[member.id] ?? 0;

                  return (
                    <div
                      key={member.id}
                      className="flex justify-between gap-3 border-b border-slate-100 pb-3"
                    >
                      <span>{member.name}</span>
                      <span
                        className={`font-semibold ${
                          balance > 0
                            ? "text-green-700"
                            : balance < 0
                              ? "text-red-600"
                              : "text-slate-600"
                        }`}
                      >
                        {balance > 0
                          ? `Gets back ${dollars(balance)}`
                          : balance < 0
                            ? `Owes ${dollars(-balance)}`
                            : "Settled"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h3 className="mt-8 font-bold">Suggested Settlements</h3>

              <div className="mt-3 space-y-3">
                {results.settlements.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No payments are needed right now.
                  </p>
                ) : (
                  results.settlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-blue-50 p-4 text-sm"
                    >
                      <strong>{settlement.from}</strong>
                      {" pays "}
                      <strong>{settlement.to}</strong>{" "}
                      <span className="font-bold text-blue-700">
                        {dollars(settlement.amountCents)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Expense History</h2>

              {expenses.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No expenses yet. Add your first shared expense.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {expense.description}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Paid by {memberName(expense.paidBy)}
                          </p>
                        </div>

                        <strong>{dollars(expense.amountCents)}</strong>
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        {Object.entries(expense.shares).map(([id, share]) => (
                          <div key={id} className="flex justify-between">
                            <span>{memberName(Number(id))}</span>
                            <span>{dollars(share)}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpenses((current) =>
                            current.filter((item) => item.id !== expense.id),
                          )
                        }
                        className="mt-4 text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete expense
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
