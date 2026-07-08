import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import type { PostWithAuthor } from "@/lib/types";

export function FeedList({
  posts,
  isAuthenticated,
}: {
  posts: PostWithAuthor[];
  isAuthenticated: boolean;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-foreground">The feed is quiet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Be the first to share a release, start a discussion, or shout out an artist
          from the Malaysian scene.
        </p>
        {isAuthenticated ? (
          <Link href="/create" className="mt-6 inline-block">
            <Button>Create the first post</Button>
          </Link>
        ) : (
          <Link href="/signup" className="mt-6 inline-block">
            <Button>Join the community</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
