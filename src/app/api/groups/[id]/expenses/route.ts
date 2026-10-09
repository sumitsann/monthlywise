import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidGroupId, verifyGroupAccess } from "@/lib/group-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Member = {
  id: string;
};

type ExpenseShare = {
  memberId: string;
  shareCents: number;
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

const MAX_AMOUNT_CENTS = 100000000000;

function fail(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: noStoreHeaders,
    },
  );
}

function isValidAmount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_AMOUNT_CENTS
  );
}

// Load saved expenses.
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

    const { data, error } = await supabase
      .from("group_expenses")
      .select("id, description, amount_cents, paid_by, created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Expense lookup failed:", error.code);
      return fail("Unable to load expenses.", 500);
    }

    const expenseIds = (data ?? []).map((expense) => expense.id);

    let savedShares: {
      expense_id: string;
      member_id: string;
      share_cents: number;
    }[] = [];

    if (expenseIds.length > 0) {
      const { data: sharesData, error: sharesError } = await supabase
        .from("expense_shares")
        .select("expense_id, member_id, share_cents")
        .eq("group_id", id)
        .in("expense_id", expenseIds);

      if (sharesError) {
        console.error("Expense share lookup failed:", sharesError.code);

        return fail("Unable to load expense shares.", 500);
      }

      savedShares = sharesData ?? [];
    }

    const expensesWithShares = (data ?? []).map((expense) => ({
      ...expense,
      shares: savedShares
        .filter((share) => share.expense_id === expense.id)
        .map((share) => ({
          memberId: share.member_id,
          shareCents: share.share_cents,
        })),
    }));

    return NextResponse.json(
      { expenses: expensesWithShares },
      { headers: noStoreHeaders },
    );
  } catch {
    return fail("Unable to load expenses.", 500);
  }
}

// Save an expense with equal or custom shares.
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidGroupId(id)) {
      return fail("Invalid group ID.", 400);
    }

    const token = request.headers.get("x-group-token") ?? "";

    if (!(await verifyGroupAccess(id, token))) {
      return fail("Invalid or missing private link.", 403);
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().startsWith("application/json")) {
      return fail("Content-Type must be application/json.", 415);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid JSON.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return fail("Invalid expense details.", 400);
    }

    const input = body as Record<string, unknown>;

    const description =
      typeof input.description === "string" ? input.description.trim() : "";

    const amountCents = input.amountCents;
    const paidBy = input.paidBy;

    if (!description || description.length > 200) {
      return fail("Description must be 1 to 200 characters.", 400);
    }

    if (!isValidAmount(amountCents)) {
      return fail("Enter a valid expense amount.", 400);
    }

    if (typeof paidBy !== "string" || !isValidGroupId(paidBy)) {
      return fail("Select a valid paying member.", 400);
    }

    const supabase = getSupabaseAdmin();

    // Load the current members from the database.
    // Never trust member IDs supplied by the browser alone.
    const { data: members, error: membersError } = await supabase
      .from("expense_members")
      .select("id")
      .eq("group_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (membersError) {
      console.error("Member lookup failed:", membersError.code);

      return fail("Unable to load group members.", 500);
    }

    const groupMembers = (members ?? []) as Member[];

    if (groupMembers.length === 0) {
      return fail("Add group members before recording expenses.", 400);
    }

    if (!groupMembers.some((member) => member.id === paidBy)) {
      return fail("The paying member must belong to this group.", 400);
    }

    const memberIds = new Set(groupMembers.map((member) => member.id));

    let shares: ExpenseShare[];

    // If custom shares are provided, validate them.
    // Otherwise, use the existing equal-split behavior.
    if (input.shares !== undefined) {
      if (
        !Array.isArray(input.shares) ||
        input.shares.length === 0 ||
        input.shares.length > 100
      ) {
        return fail("Select between 1 and 100 participants.", 400);
      }

      const validatedShares: ExpenseShare[] = [];
      const seenMembers = new Set<string>();

      for (const item of input.shares) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return fail("Invalid custom split.", 400);
        }

        const share = item as Record<string, unknown>;

        if (
          typeof share.memberId !== "string" ||
          !memberIds.has(share.memberId)
        ) {
          return fail("A selected member does not belong to this group.", 400);
        }

        if (seenMembers.has(share.memberId)) {
          return fail("A member cannot appear twice in one split.", 400);
        }

        if (
          typeof share.shareCents !== "number" ||
          !Number.isSafeInteger(share.shareCents) ||
          share.shareCents < 0 ||
          share.shareCents > MAX_AMOUNT_CENTS
        ) {
          return fail("Each share must be a valid amount.", 400);
        }

        seenMembers.add(share.memberId);

        validatedShares.push({
          memberId: share.memberId,
          shareCents: share.shareCents,
        });
      }

      shares = validatedShares;
    } else {
      // Backward-compatible equal split.
      // Your existing Add Expense form will keep working.
      if (groupMembers.length > 100) {
        return fail("Equal splits support up to 100 members.", 400);
      }

      const baseShare = Math.floor(amountCents / groupMembers.length);

      const remainder = amountCents % groupMembers.length;

      shares = groupMembers.map((member, index) => ({
        memberId: member.id,
        shareCents: baseShare + (index < remainder ? 1 : 0),
      }));
    }

    const totalShares = shares.reduce(
      (sum, share) => sum + share.shareCents,
      0,
    );

    if (totalShares !== amountCents) {
      return fail(
        "All member shares must add up exactly to the expense total.",
        400,
      );
    }

    // This database function saves the expense and
    // all shares together in a single transaction.
    const { data: expenseId, error: rpcError } = await supabase.rpc(
      "create_group_expense",
      {
        p_group_id: id,
        p_description: description,
        p_amount_cents: amountCents,
        p_paid_by: paidBy,
        p_shares: shares,
      },
    );

    if (rpcError || !expenseId) {
      console.error("Atomic expense creation failed:", rpcError?.code);

      return fail("Unable to save expense.", 500);
    }

    return NextResponse.json(
      {
        expense: {
          id: expenseId,
        },
      },
      {
        status: 201,
        headers: noStoreHeaders,
      },
    );
  } catch {
    return fail("Unable to save expense.", 500);
  }
}
