import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const token = request.headers.get("x-group-token") ?? "";

    // Validate the UUID before querying the database.
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return NextResponse.json({ error: "Invalid group." }, { status: 400 });
    }

    // Tokens are 32 random bytes encoded as base64url.
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return NextResponse.json(
        { error: "Invalid or missing private link." },
        { status: 403 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("expense_groups")
      .select("id, name, access_token_hash, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Group lookup failed:", error.code);

      return NextResponse.json(
        { error: "Unable to load group." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    const suppliedHash = createHash("sha256").update(token).digest();

    const storedHash = Buffer.from(data.access_token_hash, "hex");

    const valid =
      storedHash.length === suppliedHash.length &&
      timingSafeEqual(storedHash, suppliedHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or missing private link." },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Group verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Unable to load group." },
      { status: 500 },
    );
  }
}
