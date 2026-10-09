import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createGroupRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // STEP 1: Rate-limit group creation requests.
    // Only use this header when the request comes through
    // a trusted Vercel proxy.
    const isProduction = process.env.NODE_ENV === "production";

    const clientIp = isProduction
      ? request.headers.get("x-vercel-forwarded-for")
      : "local-development";

    if (!clientIp) {
      return NextResponse.json(
        { error: "Unable to verify request origin." },
        { status: 503 },
      );
    }

    {
      try {
        const { success, reset } = await createGroupRateLimit.limit(
          `ip:${clientIp}`,
        );

        if (!success) {
          return NextResponse.json(
            {
              error:
                "Too many group creation attempts. Please try again later.",
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(
                  Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
                ),
                "Cache-Control": "no-store",
              },
            },
          );
        }
      } catch (error) {
        console.error(
          "Group creation rate-limit check failed:",
          error instanceof Error ? error.message : "Unknown error",
        );

        return NextResponse.json(
          {
            error: "Service temporarily unavailable.",
          },
          { status: 503 },
        );
      }
    }

    // STEP 2: Require JSON.
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Expected JSON request." },
        { status: 415 },
      );
    }

    // STEP 3: Read and validate the group name.
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

    // STEP 4: Generate a secure private access token.
    const token = randomBytes(32).toString("base64url");

    // Store only the SHA-256 hash in Supabase.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // STEP 5: Create the group in Supabase.
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

    // STEP 6: Return the new group and its private token.
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
