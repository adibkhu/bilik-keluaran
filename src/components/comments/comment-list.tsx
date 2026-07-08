import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { MentionText } from "@/components/mentions/mention-text";
import { ReportButton } from "@/components/moderation/report-button";
import { AdminContentActions } from "@/components/admin/admin-panels";
import type { CommentWithAuthor } from "@/lib/types";

export function CommentList({
  comments,
  isAuthenticated,
  isAdmin,
  postId,
}: {
  comments: CommentWithAuthor[];
  isAuthenticated: boolean;
  isAdmin?: boolean;
  postId: string;
}) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <article key={comment.id} className="flex gap-3">
          <Link href={`/profile/${comment.profiles.username}`}>
            <Avatar
              src={comment.profiles.avatar_url}
              alt={comment.profiles.display_name}
              size="sm"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${comment.profiles.username}`}
                className="text-sm font-semibold hover:text-accent"
              >
                {comment.profiles.display_name}
              </Link>
              <span className="text-xs text-muted">
                @{comment.profiles.username}
              </span>
              <time
                dateTime={comment.created_at}
                className="text-xs text-muted"
              >
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </time>
            </div>
            <p className="mt-1 text-sm leading-relaxed">
              <MentionText text={comment.body} />
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isAuthenticated && (
                <ReportButton targetType="comment" targetId={comment.id} />
              )}
              {isAdmin && (
                <AdminContentActions postId={postId} commentId={comment.id} />
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
