import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidGroupId, verifyGroupAccess } from "@/lib/group-access";

type RouteContext = {
  params: Promise<{
    id: string;
    expenseId: string;
  }>;
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function fail(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: noStoreHeaders,
    },
  );
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, expenseId } = await context.params;

    // Validate both identifiers.
    if (!isValidGroupId(id) || !isValidGroupId(expenseId)) {
      return fail("Invalid group or expense ID.", 400);
    }

    // Verify the group's private access token.
    const token = request.headers.get("x-group-token") ?? "";

    if (!(await verifyGroupAccess(id, token))) {
      return fail("Invalid or missing private link.", 403);
    }

    const supabase = getSupabaseAdmin();

    // Delete the expense and its shares atomically.
    const { data: deleted, error } = await supabase.rpc(
      "delete_group_expense",
      {
        p_group_id: id,
        p_expense_id: expenseId,
      },
    );

    if (error) {
      console.error("Expense deletion failed:", error.code);

      return fail("Unable to delete expense.", 500);
    }

    if (deleted !== true) {
      return fail("Expense not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Expense deleted successfully.",
      },
      {
        status: 200,
        headers: noStoreHeaders,
      },
    );
  } catch {
    return fail("Unable to delete expense.", 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id, expenseId } = await context.params;

    // Validate both UUIDs.
    if (!isValidGroupId(id) || !isValidGroupId(expenseId)) {
      return fail("Invalid group or expense ID.", 400);
    }

    // Only holders of the private group link can edit.
    const token = request.headers.get("x-group-token") ?? "";

    if (!(await verifyGroupAccess(id, token))) {
      return fail("Invalid or missing private link.", 403);
    }

    // Reject excessively large request bodies.
    const contentLength = request.headers.get("content-length");

    if (contentLength !== null && Number(contentLength) > 20_000) {
      return fail("Request body is too large.", 413);
    }

    const rawBody = await request.text();

    if (rawBody.length > 20_000) {
      return fail("Request body is too large.", 413);
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return fail("Invalid JSON request body.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return fail("Invalid request body.", 400);
    }

    const data = body as Record<string, unknown>;

    const description =
      typeof data.description === "string" ? data.description.trim() : "";

    const amountCents = data.amountCents;
    const paidBy = data.paidBy;
    const shares = data.shares;

    if (description.length === 0 || description.length > 200) {
      return fail("Description must be between 1 and 200 characters.", 400);
    }

    if (
      typeof amountCents !== "number" ||
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0 ||
      amountCents > 100_000_000_000
    ) {
      return fail("Invalid expense amount.", 400);
    }

    if (typeof paidBy !== "string" || !isValidGroupId(paidBy)) {
      return fail("Invalid payer ID.", 400);
    }

    if (!Array.isArray(shares) || shares.length === 0 || shares.length > 100) {
      return fail("Select between 1 and 100 participants.", 400);
    }

    const seenMemberIds = new Set<string>();
    let totalShareCents = 0;

    for (const share of shares) {
      if (!share || typeof share !== "object" || Array.isArray(share)) {
        return fail("Invalid share entry.", 400);
      }

      const memberId = share.memberId;
      const shareCents = share.shareCents;

      if (
        typeof memberId !== "string" ||
        !isValidGroupId(memberId) ||
        typeof shareCents !== "number" ||
        !Number.isSafeInteger(shareCents) ||
        shareCents < 0
      ) {
        return fail("Invalid share entry.", 400);
      }

      if (seenMemberIds.has(memberId)) {
        return fail("Duplicate member in shares.", 400);
      }

      seenMemberIds.add(memberId);
      totalShareCents += shareCents;
    }

    if (totalShareCents !== amountCents) {
      return fail("Member shares must equal the expense amount.", 400);
    }

    const supabase = getSupabaseAdmin();

    // Update the expense and its shares atomically.
    const { data: updated, error } = await supabase.rpc(
      "update_group_expense",
      {
        p_group_id: id,
        p_expense_id: expenseId,
        p_description: description,
        p_amount_cents: amountCents,
        p_paid_by: paidBy,
        p_shares: shares,
      },
    );

    if (error) {
      console.error("Expense update failed:", error.code);

      return fail("Unable to update expense.", 500);
    }

    if (updated !== true) {
      return fail("Expense not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Expense updated successfully.",
      },
      {
        status: 200,
        headers: noStoreHeaders,
      },
    );
  } catch {
    return fail("Unable to update expense.", 500);
  }
}
