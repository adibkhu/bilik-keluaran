import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/nav";
import { AdminReportQueue } from "@/components/admin/admin-panels";
import type { Profile, Report } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getCurrentUser();
  if (!admin) return null;
  const supabase = createAdminClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const reporterIds = [...new Set((reports ?? []).map((r) => r.reporter_id))];
  const { data: reporterProfiles } = reporterIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", reporterIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (reporterProfiles ?? []).map((p) => [p.id, p]),
  ) as Record<string, Pick<Profile, "username" | "display_name">>;

  return (
    <>
      <Header isAuthenticated isAdmin username={admin.username} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <Link href="/admin/users" className="text-sm text-accent hover:underline">
            Manage users →
          </Link>
        </div>
        <section>
          <h2 className="mb-4 text-lg font-semibold">Report queue</h2>
          <AdminReportQueue
            reports={(reports as Report[]) ?? []}
            profiles={profileMap}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
