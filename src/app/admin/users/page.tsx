import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/nav";
import { AdminUserModeration } from "@/components/admin/admin-panels";
import type { Profile, UserModeration } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getCurrentUser();
  if (!admin) return null;
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const userIds = (profiles ?? []).map((p) => p.id);
  const { data: moderations } = userIds.length
    ? await supabase.from("user_moderation").select("*").in("user_id", userIds)
    : { data: [] };

  const moderationMap = Object.fromEntries(
    (moderations ?? []).map((m) => [m.user_id, m]),
  ) as Record<string, UserModeration>;

  return (
    <>
      <Header isAuthenticated isAdmin username={admin.username} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">User moderation</h1>
          <Link href="/admin" className="text-sm text-accent hover:underline">
            ← Report queue
          </Link>
        </div>
        <div className="space-y-4">
          {(profiles as Profile[] | null)?.map((profile) => (
            <AdminUserModeration
              key={profile.id}
              user={profile}
              moderation={moderationMap[profile.id] ?? null}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
