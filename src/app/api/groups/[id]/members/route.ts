import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidGroupId, verifyGroupAccess } from "@/lib/group-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: noStoreHeaders },
  );
}

// GET: Load members belonging to a private group.
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidGroupId(id)) {
      return jsonError("Invalid group ID.", 400);
    }

    const token = request.headers.get("x-group-token") ?? "";

    const allowed = await verifyGroupAccess(id, token);

    if (!allowed) {
      return jsonError("Invalid or missing private link.", 403);
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("expense_members")
      .select("id, name, created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Member lookup failed:", error.code);
      return jsonError("Unable to load members.", 500);
    }

    return NextResponse.json(
      { members: data ?? [] },
      { headers: noStoreHeaders },
    );
  } catch {
    return jsonError("Unable to load members.", 500);
  }
}

// POST: Add a new member to a private group.
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidGroupId(id)) {
      return jsonError("Invalid group ID.", 400);
    }

    const token = request.headers.get("x-group-token") ?? "";

    const allowed = await verifyGroupAccess(id, token);

    if (!allowed) {
      return jsonError("Invalid or missing private link.", 403);
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().startsWith("application/json")) {
      return jsonError("Content-Type must be application/json.", 415);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON.", 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !("name" in body) ||
      typeof body.name !== "string"
    ) {
      return jsonError("Member name is required.", 400);
    }

    const name = body.name.trim();

    if (!name || name.length > 100) {
      return jsonError("Member name must be 1 to 100 characters.", 400);
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("expense_members")
      .insert({
        group_id: id,
        name,
      })
      .select("id, name, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return jsonError("This member name already exists in the group.", 409);
      }

      console.error("Member insert failed:", error.code);
      return jsonError("Unable to add member.", 500);
    }

    return NextResponse.json(
      { member: data },
      {
        status: 201,
        headers: noStoreHeaders,
      },
    );
  } catch {
    return jsonError("Unable to add member.", 500);
  }
}
