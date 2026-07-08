import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { PostTypeBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MentionText } from "@/components/mentions/mention-text";
import { TrackPreview } from "@/components/posts/track-preview";
import type { PostWithAuthor } from "@/lib/types";
import { USER_ROLE_LABELS } from "@/lib/constants";

export function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.profiles.username}`}>
          <Avatar
            src={post.profiles.avatar_url}
            alt={post.profiles.display_name}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profile/${post.profiles.username}`}
              className="font-semibold text-foreground hover:text-accent"
            >
              {post.profiles.display_name}
            </Link>
            <span className="text-sm text-muted">@{post.profiles.username}</span>
            <span className="text-xs text-muted">
              · {USER_ROLE_LABELS[post.profiles.role]}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PostTypeBadge type={post.post_type} />
            <time
              dateTime={post.created_at}
              className="text-xs text-muted"
              title={new Date(post.created_at).toLocaleString()}
            >
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </time>
          </div>
        </div>
      </div>

      <div className="text-sm leading-relaxed text-foreground/90">
        <MentionText text={post.body} />
      </div>

      {post.track_url && (
        <TrackPreview url={post.track_url} metadata={post.track_metadata} />
      )}

      {post.image_urls.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {post.image_urls.map((url) => (
            <Image
              key={url}
              src={url}
              alt="Post attachment"
              width={600}
              height={400}
              className="max-h-80 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="pt-1">
        <Link
          href={`/post/${post.id}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          View discussion →
        </Link>
      </div>
    </Card>
  );
}
