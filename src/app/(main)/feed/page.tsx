import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/layout/footer";
import { Header, MobileNav } from "@/components/layout/nav";
import { FeedList } from "@/components/feed/feed-list";
import { SITE_TAGLINE } from "@/lib/constants";
import type { PostWithAuthor } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_user_id_fkey(username, display_name, avatar_url, role)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <Header
        isAuthenticated={!!user}
        isAdmin={user?.is_admin}
        username={user?.username}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
          <p className="mt-1 text-sm text-muted">{SITE_TAGLINE}</p>
        </div>
        <FeedList
          posts={(posts as PostWithAuthor[] | null) ?? []}
          isAuthenticated={!!user}
        />
      </main>
      <Footer />
      <MobileNav isAuthenticated={!!user} />
    </>
  );
}
