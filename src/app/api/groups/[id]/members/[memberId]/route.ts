import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidGroupId, verifyGroupAccess } from "@/lib/group-access";

type RouteContext = {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

const memberInUseMessage =
  "This member is part of recorded expenses. Edit or delete those expenses first.";

function fail(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: noStoreHeaders,
    },
  );
}

// DELETE: Remove a member who isn't part of any recorded expense.
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, memberId } = await context.params;

    if (!isValidGroupId(id) || !isValidGroupId(memberId)) {
      return fail("Invalid group or member ID.", 400);
    }

    const token = request.headers.get("x-group-token") ?? "";

    if (!(await verifyGroupAccess(id, token))) {
      return fail("Invalid or missing private link.", 403);
    }

    const supabase = getSupabaseAdmin();

    // Removing a payer or participant would silently change balances,
    // so only members with no expense history can be deleted.
    const [paidResult, sharesResult] = await Promise.all([
      supabase
        .from("group_expenses")
        .select("id", { count: "exact", head: true })
        .eq("group_id", id)
        .eq("paid_by", memberId),
      supabase
        .from("expense_shares")
        .select("expense_id", { count: "exact", head: true })
        .eq("group_id", id)
        .eq("member_id", memberId),
    ]);

    if (paidResult.error || sharesResult.error) {
      console.error(
        "Member usage lookup failed:",
        paidResult.error?.code ?? sharesResult.error?.code,
      );
      return fail("Unable to delete member.", 500);
    }

    if ((paidResult.count ?? 0) > 0 || (sharesResult.count ?? 0) > 0) {
      return fail(memberInUseMessage, 409);
    }

    const { data, error } = await supabase
      .from("expense_members")
      .delete()
      .eq("group_id", id)
      .eq("id", memberId)
      .select("id");

    if (error) {
      // Foreign key violation: an expense referencing this member was
      // added after the usage check above.
      if (error.code === "23503") {
        return fail(memberInUseMessage, 409);
      }

      console.error("Member deletion failed:", error.code);
      return fail("Unable to delete member.", 500);
    }

    if (!data || data.length === 0) {
      return fail("Member not found.", 404);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Member deleted successfully.",
      },
      {
        status: 200,
        headers: noStoreHeaders,
      },
    );
  } catch {
    return fail("Unable to delete member.", 500);
  }
}
