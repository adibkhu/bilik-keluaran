import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/lib/types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const { data: moderation } = await supabase
    .from("user_moderation")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return { ...profile, moderation: moderation ?? null };
}

export async function requireActiveUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be signed in.");
  }
  if (user.moderation?.status === "banned") {
    throw new Error("Your account has been permanently banned.");
  }
  if (user.moderation?.status === "suspended") {
    throw new Error("Your account is suspended. Contact support if you think this is a mistake.");
  }
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireActiveUser();
  if (!user.is_admin) {
    throw new Error("Admin access required.");
  }
  return user;
}

export function isBetaClosed(): boolean {
  return process.env.BETA_CLOSED === "true";
}

export function isValidInviteCode(code: string | null | undefined): boolean {
  const expected = process.env.BETA_INVITE_CODE;
  if (!expected) return true;
  return code === expected;
}
