import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Expected JSON request." },
        { status: 415 },
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof body.name !== "string"
    ) {
      return NextResponse.json(
        { error: "Enter a valid group name." },
        { status: 400 },
      );
    }

    const name = body.name.trim();

    if (name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { error: "Group name must be 1–100 characters." },
        { status: 400 },
      );
    }

    // Generate a cryptographically random access token.
    const token = randomBytes(32).toString("base64url");

    // Store only its SHA-256 hash in Supabase.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("expense_groups")
      .insert({
        name,
        access_token_hash: tokenHash,
      })
      .select("id, name")
      .single();

    if (error || !data) {
      console.error("Group creation failed:", error?.code);

      return NextResponse.json(
        { error: "Unable to create group." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        token,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Unexpected group creation error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 },
    );
  }
}
