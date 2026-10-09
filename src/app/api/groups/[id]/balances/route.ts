import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidGroupId, verifyGroupAccess } from "@/lib/group-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MemberRow = {
  id: string;
  name: string;
};

type ExpenseRow = {
  id: string;
  amount_cents: number;
  paid_by: string;
};

type ShareRow = {
  expense_id: string;
  member_id: string;
  share_cents: number;
};

type Balance = {
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

const noStore = {
  "Cache-Control": "no-store",
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: noStore });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidGroupId(id)) {
      return fail("Invalid group ID.", 400);
    }

    const token = request.headers.get("x-group-token") ?? "";

    if (!(await verifyGroupAccess(id, token))) {
      return fail("Invalid or missing private link.", 403);
    }

    const supabase = getSupabaseAdmin();

    const [membersResult, expensesResult, sharesResult] = await Promise.all([
      supabase
        .from("expense_members")
        .select("id, name")
        .eq("group_id", id)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true }),

      supabase
        .from("group_expenses")
        .select("id, amount_cents, paid_by")
        .eq("group_id", id),

      supabase
        .from("expense_shares")
        .select("expense_id, member_id, share_cents")
        .eq("group_id", id),
    ]);

    if (membersResult.error || expensesResult.error || sharesResult.error) {
      return fail("Unable to calculate balances.", 500);
    }

    const members = (membersResult.data ?? []) as MemberRow[];

    const expenses = (expensesResult.data ?? []) as ExpenseRow[];

    const shares = (sharesResult.data ?? []) as ShareRow[];

    // Guard against incomplete expense data.
    const sharesByExpense = new Map<string, number>();

    for (const share of shares) {
      sharesByExpense.set(
        share.expense_id,
        (sharesByExpense.get(share.expense_id) ?? 0) + share.share_cents,
      );
    }

    for (const expense of expenses) {
      if ((sharesByExpense.get(expense.id) ?? 0) !== expense.amount_cents) {
        return fail("Some expenses have incomplete shares.", 409);
      }
    }

    const balances: Balance[] = members.map((member) => ({
      memberId: member.id,
      name: member.name,
      paidCents: 0,
      owedCents: 0,
      balanceCents: 0,
    }));

    const balanceMap = new Map(
      balances.map((balance) => [balance.memberId, balance]),
    );

    for (const expense of expenses) {
      const payer = balanceMap.get(expense.paid_by);

      if (!payer) {
        return fail("An expense has an invalid paying member.", 409);
      }

      payer.paidCents += expense.amount_cents;
    }

    for (const share of shares) {
      const member = balanceMap.get(share.member_id);

      if (!member) {
        return fail("An expense has an invalid share member.", 409);
      }

      member.owedCents += share.share_cents;
    }

    for (const balance of balances) {
      balance.balanceCents = balance.paidCents - balance.owedCents;
    }

    const creditors = balances
      .filter((member) => member.balanceCents > 0)
      .map((member) => ({
        ...member,
        remaining: member.balanceCents,
      }))
      .sort(
        (a, b) => b.remaining - a.remaining || a.name.localeCompare(b.name),
      );

    const debtors = balances
      .filter((member) => member.balanceCents < 0)
      .map((member) => ({
        ...member,
        remaining: -member.balanceCents,
      }))
      .sort(
        (a, b) => b.remaining - a.remaining || a.name.localeCompare(b.name),
      );

    const settlements: Settlement[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const amountCents = Math.min(debtor.remaining, creditor.remaining);

      if (amountCents > 0) {
        settlements.push({
          fromId: debtor.memberId,
          fromName: debtor.name,
          toId: creditor.memberId,
          toName: creditor.name,
          amountCents,
        });
      }

      debtor.remaining -= amountCents;
      creditor.remaining -= amountCents;

      if (debtor.remaining === 0) {
        debtorIndex++;
      }

      if (creditor.remaining === 0) {
        creditorIndex++;
      }
    }

    const totalExpensesCents = expenses.reduce(
      (sum, expense) => sum + expense.amount_cents,
      0,
    );

    return NextResponse.json(
      {
        balances,
        settlements,
        totalExpensesCents,
        expenseCount: expenses.length,
      },
      { headers: noStore },
    );
  } catch {
    return fail("Unable to calculate balances.", 500);
  }
}
