"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  adminDeleteComment,
  adminDeletePost,
  adminModerateUser,
  adminUpdateReportStatus,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import type { Report, Profile, UserModeration } from "@/lib/types";

export function AdminReportQueue({
  reports,
  profiles,
}: {
  reports: Report[];
  profiles: Record<string, Pick<Profile, "username" | "display_name">>;
}) {
  const [pending, startTransition] = useTransition();

  function updateStatus(
    reportId: string,
    status: "reviewed" | "dismissed" | "actioned",
  ) {
    startTransition(async () => {
      await adminUpdateReportStatus(reportId, status);
    });
  }

  if (reports.length === 0) {
    return <p className="text-sm text-muted">No pending reports. All clear.</p>;
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const reporter = profiles[report.reporter_id];
        return (
          <div
            key={report.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold capitalize">
                {report.target_type} report
              </p>
              <time className="text-xs text-muted">
                {formatDistanceToNow(new Date(report.created_at), {
                  addSuffix: true,
                })}
              </time>
            </div>
            <p className="mt-2 text-sm">{report.reason}</p>
            <p className="mt-1 text-xs text-muted">
              Reported by {reporter?.display_name ?? "Unknown"} (@
              {reporter?.username ?? "unknown"})
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={pending}
                onClick={() => updateStatus(report.id, "actioned")}
              >
                Mark actioned
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => updateStatus(report.id, "dismissed")}
              >
                Dismiss
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminContentActions({
  postId,
  commentId,
}: {
  postId?: string;
  commentId?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {postId && (
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await adminDeletePost(postId);
            })
          }
        >
          Delete post
        </Button>
      )}
      {commentId && postId && (
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await adminDeleteComment(commentId, postId);
            })
          }
        >
          Delete comment
        </Button>
      )}
    </div>
  );
}

export function AdminUserModeration({
  user,
  moderation,
}: {
  user: Profile;
  moderation: UserModeration | null;
}) {
  const [pending, startTransition] = useTransition();

  function moderate(status: "active" | "suspended" | "banned") {
    const reason = window.prompt(`Reason for ${status}?`) ?? "";
    startTransition(async () => {
      await adminModerateUser(user.id, status, reason);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="font-semibold">
        {user.display_name}{" "}
        <span className="text-sm text-muted">@{user.username}</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        Status: {moderation?.status ?? "active"}
        {moderation?.reason ? ` — ${moderation.reason}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={pending || user.is_admin}
          onClick={() => moderate("suspended")}
        >
          Suspend
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={pending || user.is_admin}
          onClick={() => moderate("banned")}
        >
          Ban
        </Button>
        <Button
          size="sm"
          disabled={pending}
          onClick={() => moderate("active")}
        >
          Reinstate
        </Button>
      </div>
    </div>
  );
}
