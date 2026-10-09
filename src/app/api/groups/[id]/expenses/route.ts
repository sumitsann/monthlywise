import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidGroupId, verifyGroupAccess } from "@/lib/group-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const headers = {
  "Cache-Control": "no-store",
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers });
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

    const { data, error } = await supabase
      .from("group_expenses")
      .select("id, description, amount_cents, paid_by, created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Expense lookup failed:", error.code);
      return fail("Unable to load expenses.", 500);
    }

    return NextResponse.json({ expenses: data ?? [] }, { headers });
  } catch {
    return fail("Unable to load expenses.", 500);
  }
}

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

    if (
      typeof amountCents !== "number" ||
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0 ||
      amountCents > 100000000000
    ) {
      return fail("Enter a valid expense amount.", 400);
    }

    if (typeof paidBy !== "string" || !isValidGroupId(paidBy)) {
      return fail("Select a valid paying member.", 400);
    }

    const supabase = getSupabaseAdmin();

    const { data: members, error: membersError } = await supabase
      .from("expense_members")
      .select("id")
      .eq("group_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (membersError) {
      return fail("Unable to load group members.", 500);
    }

    if (!members || members.length === 0) {
      return fail("Add group members before recording expenses.", 400);
    }

    if (!members.some((member) => member.id === paidBy)) {
      return fail("The paying member must belong to this group.", 400);
    }

    // Split in integer cents to avoid floating-point errors.
    // Distribute any remaining cents deterministically.
    const baseShare = Math.floor(amountCents / members.length);

    const remainder = amountCents % members.length;

    const { data: expense, error: expenseError } = await supabase
      .from("group_expenses")
      .insert({
        group_id: id,
        description,
        amount_cents: amountCents,
        paid_by: paidBy,
      })
      .select("id, description, amount_cents, paid_by, created_at")
      .single();

    if (expenseError || !expense) {
      console.error("Expense insert failed:", expenseError?.code);
      return fail("Unable to save expense.", 500);
    }

    const shares = members.map((member, index) => ({
      group_id: id,
      expense_id: expense.id,
      member_id: member.id,
      share_cents: baseShare + (index < remainder ? 1 : 0),
    }));

    const { error: sharesError } = await supabase
      .from("expense_shares")
      .insert(shares);

    if (sharesError) {
      console.error("Expense shares insert failed:", sharesError.code);

      // Roll back the expense if saving shares fails.
      const { error: rollbackError } = await supabase
        .from("group_expenses")
        .delete()
        .eq("id", expense.id)
        .eq("group_id", id);

      if (rollbackError) {
        console.error("Expense rollback failed:", rollbackError.code);
      }

      return fail("Unable to save expense shares.", 500);
    }

    return NextResponse.json({ expense }, { status: 201, headers });
  } catch {
    return fail("Unable to save expense.", 500);
  }
}
