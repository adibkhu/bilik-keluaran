import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/layout/footer";
import { Header, MobileNav } from "@/components/layout/nav";
import { Avatar } from "@/components/ui/avatar";
import { PostTypeBadge } from "@/components/ui/badge";
import { MentionText } from "@/components/mentions/mention-text";
import { TrackPreview } from "@/components/posts/track-preview";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { ReportButton } from "@/components/moderation/report-button";
import { AdminContentActions } from "@/components/admin/admin-panels";
import type { CommentWithAuthor, PostWithAuthor } from "@/lib/types";
import { USER_ROLE_LABELS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_user_id_fkey(username, display_name, avatar_url, role)",
    )
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select(
      "*, profiles!comments_user_id_fkey(username, display_name, avatar_url)",
    )
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const typedPost = post as PostWithAuthor;

  return (
    <>
      <Header
        isAuthenticated={!!user}
        isAdmin={user?.is_admin}
        username={user?.username}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        <article className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${typedPost.profiles.username}`}>
              <Avatar
                src={typedPost.profiles.avatar_url}
                alt={typedPost.profiles.display_name}
              />
            </Link>
            <div>
              <Link
                href={`/profile/${typedPost.profiles.username}`}
                className="font-semibold hover:text-accent"
              >
                {typedPost.profiles.display_name}
              </Link>
              <p className="text-sm text-muted">
                @{typedPost.profiles.username} ·{" "}
                {USER_ROLE_LABELS[typedPost.profiles.role]}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <PostTypeBadge type={typedPost.post_type} />
                <time className="text-xs text-muted">
                  {formatDistanceToNow(new Date(typedPost.created_at), {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm leading-relaxed">
            <MentionText text={typedPost.body} />
          </div>

          {typedPost.track_url && (
            <div className="mt-4">
              <TrackPreview
                url={typedPost.track_url}
                metadata={typedPost.track_metadata}
              />
            </div>
          )}

          {typedPost.image_urls.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {typedPost.image_urls.map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt="Post attachment"
                  width={600}
                  height={400}
                  className="max-h-96 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {user && (
              <ReportButton targetType="post" targetId={typedPost.id} />
            )}
            {user?.is_admin && (
              <AdminContentActions postId={typedPost.id} />
            )}
          </div>
        </article>

        <section className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold">Comments</h2>
          <CommentList
            comments={(comments as CommentWithAuthor[]) ?? []}
            isAuthenticated={!!user}
            isAdmin={user?.is_admin}
            postId={id}
          />
          {user ? (
            <CommentForm postId={id} />
          ) : (
            <p className="text-sm text-muted">
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>{" "}
              to join the discussion.
            </p>
          )}
        </section>
      </main>
      <Footer />
      <MobileNav isAuthenticated={!!user} />
    </>
  );
}
