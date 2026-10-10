import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { isGroupLinkExpired } from "@/lib/group-link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidGroupId(id: string) {
  return uuidPattern.test(id);
}

export async function verifyGroupAccess(
  groupId: string,
  token: string,
): Promise<boolean> {
  if (!isValidGroupId(groupId) || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return false;
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("expense_groups")
    .select("access_token_hash, created_at")
    .eq("id", groupId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify group access.");
  }

  if (!data || isGroupLinkExpired(data.created_at)) {
    return false;
  }

  const suppliedHash = createHash("sha256").update(token).digest();

  const storedHash = Buffer.from(data.access_token_hash, "hex");

  return (
    storedHash.length === suppliedHash.length &&
    timingSafeEqual(storedHash, suppliedHash)
  );
}
