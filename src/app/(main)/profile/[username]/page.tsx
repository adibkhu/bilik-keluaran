import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/layout/footer";
import { Header, MobileNav } from "@/components/layout/nav";
import { Avatar } from "@/components/ui/avatar";
import { PostCard } from "@/components/feed/post-card";
import Link from "next/link";
import { USER_ROLE_LABELS } from "@/lib/constants";
import type { PostWithAuthor, Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_user_id_fkey(username, display_name, avatar_url, role)",
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const typedProfile = profile as Profile;

  return (
    <>
      <Header
        isAuthenticated={!!user}
        isAdmin={user?.is_admin}
        username={user?.username}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-start gap-4">
            <Avatar
              src={typedProfile.avatar_url}
              alt={typedProfile.display_name}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold">{typedProfile.display_name}</h1>
              <p className="text-muted">@{typedProfile.username}</p>
              <p className="mt-1 text-sm text-accent">
                {USER_ROLE_LABELS[typedProfile.role]}
              </p>
              {typedProfile.bio && (
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {typedProfile.bio}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Posts</h2>
          {(posts as PostWithAuthor[] | null)?.length ? (
            (posts as PostWithAuthor[]).map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm text-muted">No posts yet.</p>
              {user?.id === typedProfile.id && (
                <Link href="/create" className="mt-4 inline-block">
                  <Button size="sm">Share your first post</Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <MobileNav isAuthenticated={!!user} />
    </>
  );
}
