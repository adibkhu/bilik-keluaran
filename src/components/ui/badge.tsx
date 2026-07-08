import { cn } from "@/lib/utils";
import type { PostType } from "@/lib/types";
import { POST_TYPE_LABELS } from "@/lib/constants";

const colorMap: Record<PostType, string> = {
  new_release: "bg-accent/15 text-accent border-accent/30",
  discussion: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  gig_event: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  collab_feedback: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  discovery: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function PostTypeBadge({
  type,
  className,
}: {
  type: PostType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorMap[type],
        className,
      )}
    >
      {POST_TYPE_LABELS[type]}
    </span>
  );
}
