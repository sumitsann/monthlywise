"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  GROUP_LINK_LIFETIME_DAYS,
  getGroupLinkDaysLeft,
} from "@/lib/group-link";

type Group = {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string;
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
  shares: {
    memberId: string;
    shareCents: number;
  }[];
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

function daysLeftLabel(createdAt: string) {
  const days = getGroupLinkDaysLeft(createdAt);

  return days === 1 ? "1 day left" : `${days} days left`;
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
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [expenseError, setExpenseError] = useState("");

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("");

  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  // Members seen so far, so only newly added ones get auto-selected.
  const knownMemberIdsRef = useRef<Set<string>>(new Set());

  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(
    null,
  );

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

        const loadedMembers = (result.members ?? []) as Member[];

        setMembers(loadedMembers);

        // Select every member by default, including newly added ones,
        // but keep anyone the user has unchecked unchecked.
        const knownIds = knownMemberIdsRef.current;
        const newIds = loadedMembers
          .map((member) => member.id)
          .filter((memberId) => !knownIds.has(memberId));

        knownMemberIdsRef.current = new Set(
          loadedMembers.map((member) => member.id),
        );

        setSelectedMemberIds((current) => {
          const validIds = new Set(loadedMembers.map((member) => member.id));

          return [
            ...current.filter((memberId) => validIds.has(memberId)),
            ...newIds.filter((memberId) => !current.includes(memberId)),
          ];
        });
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

  function isMemberInExpenses(memberId: string) {
    return expenses.some(
      (expense) =>
        expense.paid_by === memberId ||
        expense.shares.some((share) => share.memberId === memberId),
    );
  }

  async function deleteMember(memberId: string) {
    const member = members.find((item) => item.id === memberId);

    if (!member || deletingMemberId) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${member.name}" from this group?`,
    );

    if (!confirmed) {
      return;
    }

    const token = getPrivateToken();

    if (!token) {
      setMemberError("The private token is missing from this link.");
      return;
    }

    setDeletingMemberId(memberId);
    setMemberError("");

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`,
        {
          method: "DELETE",
          headers: {
            "x-group-token": token,
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete member.");
      }

      if (expensePaidBy === memberId) {
        setExpensePaidBy("");
      }

      await loadMembers(token);
      await loadBalances(token);
    } catch (caught) {
      setMemberError(
        caught instanceof Error ? caught.message : "Unable to delete member.",
      );
    } finally {
      setDeletingMemberId(null);
    }
  }

  function toggleExpenseMember(memberId: string) {
    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  function updateCustomShare(memberId: string, amount: string) {
    setCustomShares((current) => ({
      ...current,
      [memberId]: amount,
    }));
  }

  function parseDollarsToCents(value: string): number | null {
    const text = value.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      return null;
    }

    const [dollars, cents = ""] = text.split(".");

    const result = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));

    return Number.isSafeInteger(result) ? result : null;
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

    if (selectedMemberIds.length === 0) {
      setExpenseError("Select at least one member to share this expense.");
      return;
    }

    if (selectedMemberIds.length > 100) {
      setExpenseError("A split can include up to 100 members.");
      return;
    }

    let expenseShares: {
      memberId: string;
      shareCents: number;
    }[];

    if (splitMode === "equal") {
      const baseShare = Math.floor(amountCents / selectedMemberIds.length);

      const remainder = amountCents % selectedMemberIds.length;

      expenseShares = selectedMemberIds.map((memberId, index) => ({
        memberId,
        shareCents: baseShare + (index < remainder ? 1 : 0),
      }));
    } else {
      const shares = selectedMemberIds.map((memberId) => ({
        memberId,
        shareCents: parseDollarsToCents(customShares[memberId] ?? ""),
      }));

      if (
        shares.some(
          (share) => share.shareCents === null || share.shareCents < 0,
        )
      ) {
        setExpenseError(
          "Enter a valid custom amount for every selected member.",
        );
        return;
      }

      expenseShares = shares as {
        memberId: string;
        shareCents: number;
      }[];

      const shareTotal = expenseShares.reduce(
        (sum, share) => sum + share.shareCents,
        0,
      );

      if (shareTotal !== amountCents) {
        setExpenseError(
          `Custom shares must total ${formatMoney(amountCents)}. ` +
            `Current total: ${formatMoney(shareTotal)}.`,
        );
        return;
      }
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
            shares: expenseShares,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save expense.");
      }

      setExpenseDescription("");
      setExpenseAmount("");

      setSplitMode("equal");
      setCustomShares({});
      setSelectedMemberIds(members.map((member) => member.id));

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

  async function deleteExpense(expenseId: string) {
    const expense = expenses.find((item) => item.id === expenseId);

    if (!expense || deletingExpenseId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${expense.description}"?\n\n` +
        `Amount: ${formatMoney(expense.amount_cents)}\n\n` +
        "This will permanently delete the expense and its shares. " +
        "Group balances will be recalculated.",
    );

    if (!confirmed) {
      return;
    }

    const token = getPrivateToken();

    if (!token) {
      setExpenseError(
        "Your private group token is missing. Open the complete private link.",
      );
      return;
    }

    setDeletingExpenseId(expenseId);
    setExpenseError("");

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(id)}/expenses/${encodeURIComponent(expenseId)}`,
        {
          method: "DELETE",
          headers: {
            "x-group-token": token,
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete expense.");
      }

      // Refresh the saved expense history.
      await loadExpenses(token);

      // Recalculate balances and settlements.
      await loadBalances(token);
    } catch (error) {
      setExpenseError(
        error instanceof Error ? error.message : "Unable to delete expense.",
      );
    } finally {
      setDeletingExpenseId(null);
    }
  }

  function startEditingExpense(expenseId: string) {
    const expense = expenses.find((item) => item.id === expenseId);

    if (!expense) {
      return;
    }

    // Load the saved expense into the existing form.
    setExpenseDescription(expense.description);
    setExpenseAmount((expense.amount_cents / 100).toFixed(2));
    setExpensePaidBy(expense.paid_by);

    // Load the original participants and their shares.
    setSelectedMemberIds(expense.shares.map((share) => share.memberId));

    setCustomShares(
      Object.fromEntries(
        expense.shares.map((share) => [
          share.memberId,
          (share.shareCents / 100).toFixed(2),
        ]),
      ),
    );

    // Custom mode preserves the original saved amounts.
    setSplitMode("custom");

    setEditingExpenseId(expenseId);
    setEditError("");

    // Move the user to the expense form.
    document.getElementById("expense-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  function cancelEditingExpense() {
    setEditingExpenseId(null);
    setEditError("");
    setExpenseDescription("");
    setExpenseAmount("");
    setExpensePaidBy("");
    setSplitMode("equal");
    setCustomShares({});
    setSelectedMemberIds(members.map((member) => member.id));
  }

  async function updateExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingExpenseId || savingEdit) {
      return;
    }

    const description = expenseDescription.trim();
    const amountCents = parseDollarsToCents(expenseAmount);

    if (!description || description.length > 200) {
      setEditError("Enter a description between 1 and 200 characters.");
      return;
    }

    if (
      amountCents === null ||
      amountCents <= 0 ||
      amountCents > 100_000_000_000
    ) {
      setEditError("Enter a valid expense amount.");
      return;
    }

    if (!expensePaidBy) {
      setEditError("Select who paid.");
      return;
    }

    if (selectedMemberIds.length === 0 || selectedMemberIds.length > 100) {
      setEditError("Select between 1 and 100 participants.");
      return;
    }

    let shares: { memberId: string; shareCents: number }[];

    if (splitMode === "equal") {
      const base = Math.floor(amountCents / selectedMemberIds.length);
      const remainder = amountCents % selectedMemberIds.length;

      shares = selectedMemberIds.map((memberId, index) => ({
        memberId,
        shareCents: base + (index < remainder ? 1 : 0),
      }));
    } else {
      const parsed = selectedMemberIds.map((memberId) => ({
        memberId,
        shareCents: parseDollarsToCents(customShares[memberId] ?? ""),
      }));

      if (parsed.some((share) => share.shareCents === null)) {
        setEditError("Enter a valid share for every selected member.");
        return;
      }

      shares = parsed as { memberId: string; shareCents: number }[];

      const total = shares.reduce((sum, share) => sum + share.shareCents, 0);

      if (total !== amountCents) {
        setEditError(
          `Shares must total ${formatMoney(amountCents)}. ` +
            `Current total: ${formatMoney(total)}.`,
        );
        return;
      }
    }

    const token = getPrivateToken();

    if (!token) {
      setEditError("The private group token is missing.");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(id)}/expenses/${encodeURIComponent(editingExpenseId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-group-token": token,
          },
          body: JSON.stringify({
            description,
            amountCents,
            paidBy: expensePaidBy,
            shares,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update expense.");
      }

      await Promise.all([loadExpenses(token), loadBalances(token)]);

      cancelEditingExpense();
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Unable to update expense.",
      );
    } finally {
      setSavingEdit(false);
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

              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                This link expires on{" "}
                <strong>
                  {new Date(group.expiresAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </strong>{" "}
                ({daysLeftLabel(group.createdAt)}). Group links are available
                for {GROUP_LINK_LIFETIME_DAYS} days after the group is created,
                then the group can no longer be opened.
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
                    {members.map((member) => {
                      const inExpenses = isMemberInExpenses(member.id);

                      return (
                        <li
                          key={member.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {member.name.charAt(0).toUpperCase()}
                          </span>

                          <span className="min-w-0 flex-1 truncate font-medium">
                            {member.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => deleteMember(member.id)}
                            disabled={deletingMemberId !== null || inExpenses}
                            title={
                              inExpenses
                                ? "Edit or delete this member's expenses first."
                                : undefined
                            }
                            aria-label={`Delete ${member.name}`}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingMemberId === member.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {members.some((member) => isMemberInExpenses(member.id)) && (
                  <p className="mt-2 text-sm text-slate-500">
                    Members who paid for or share an expense can&apos;t be
                    deleted until those expenses are edited or removed.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold">Shared Expenses</h2>

              <p className="mt-2 text-slate-600">
                Record shared expenses and split them equally or customize each
                member&apos;s share.
              </p>

              <form
                id="expense-form"
                onSubmit={editingExpenseId ? updateExpense : addExpense}
                className="mt-6 space-y-4"
              >
                {editingExpenseId && (
                  <div
                    role="status"
                    className="rounded-xl border border-blue-200 bg-blue-50 p-4"
                  >
                    <p className="font-semibold text-blue-900">
                      Editing Existing Expense
                    </p>
                    <p className="mt-1 text-sm text-blue-800">
                      You are updating a saved expense. Click Save Changes to
                      update it, or Cancel Edit to leave it unchanged.
                    </p>
                  </div>
                )}
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

                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold">
                    How should this expense be split?
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-5">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitMode === "equal"}
                        onChange={() => setSplitMode("equal")}
                      />
                      <span>Equal Split</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitMode === "custom"}
                        onChange={() => setSplitMode("custom")}
                      />
                      <span>Custom Split</span>
                    </label>
                  </div>

                  <p className="mt-5 text-sm font-semibold">
                    Select participating members
                  </p>

                  <div className="mt-3 space-y-3">
                    {members.map((member) => {
                      const selected = selectedMemberIds.includes(member.id);

                      return (
                        <div
                          key={member.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                        >
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleExpenseMember(member.id)}
                              className="h-4 w-4"
                            />

                            <span className="font-medium">{member.name}</span>
                          </label>

                          {selected && splitMode === "custom" && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">$</span>

                              <input
                                type="text"
                                inputMode="decimal"
                                value={customShares[member.id] ?? ""}
                                onChange={(event) =>
                                  updateCustomShare(
                                    member.id,
                                    event.target.value,
                                  )
                                }
                                placeholder="0.00"
                                aria-label={`Share for ${member.name}`}
                                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {splitMode === "equal" && (
                    <p className="mt-4 text-sm text-slate-600">
                      The total will be divided equally among{" "}
                      {selectedMemberIds.length} selected{" "}
                      {selectedMemberIds.length === 1 ? "member" : "members"}.
                    </p>
                  )}

                  {splitMode === "custom" && (
                    <div className="mt-5 rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        Custom shares total
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-800">
                        {formatMoney(
                          selectedMemberIds.reduce((sum, memberId) => {
                            return (
                              sum +
                              (parseDollarsToCents(
                                customShares[memberId] ?? "",
                              ) ?? 0)
                            );
                          }, 0),
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Expense total:{" "}
                        {formatMoney(parseDollarsToCents(expenseAmount) ?? 0)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={
                      savingExpense || savingEdit || members.length === 0
                    }
                    className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {savingEdit
                      ? "Saving changes..."
                      : editingExpenseId
                        ? "Save Changes"
                        : savingExpense
                          ? "Saving expense..."
                          : "Add Expense"}
                  </button>

                  {editingExpenseId && (
                    <button
                      type="button"
                      onClick={cancelEditingExpense}
                      disabled={savingEdit}
                      className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {expenseError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {expenseError}
                </p>
              )}
              {editError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {editError}
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
                        <li key={expense.id} className="p-4">
                          {/* Expense description, payer, and total */}
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold">
                                {expense.description}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                Paid by {payer?.name ?? "Unknown member"}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <p className="whitespace-nowrap font-bold">
                                {formatMoney(expense.amount_cents)}
                              </p>

                              <button
                                type="button"
                                onClick={() => startEditingExpense(expense.id)}
                                disabled={
                                  deletingExpenseId !== null || savingEdit
                                }
                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteExpense(expense.id)}
                                disabled={
                                  deletingExpenseId !== null ||
                                  editingExpenseId !== null ||
                                  savingEdit
                                }
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingExpenseId === expense.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>

                          {/* Saved split details */}
                          <div className="mt-4 border-t border-slate-200 pt-3">
                            <p className="mb-2 text-sm font-semibold text-slate-700">
                              Split details
                            </p>

                            {!expense.shares || expense.shares.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No split details available.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {expense.shares.map((share) => {
                                  const member = members.find(
                                    (item) => item.id === share.memberId,
                                  );

                                  return (
                                    <div
                                      key={share.memberId}
                                      className="flex items-center justify-between gap-3 text-sm"
                                    >
                                      <span className="text-slate-600">
                                        {member?.name ?? "Unknown member"}
                                      </span>

                                      <span className="font-semibold text-slate-900">
                                        {formatMoney(share.shareCents)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
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
