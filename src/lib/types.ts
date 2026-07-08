export type UserRole = "fan" | "producer" | "artist";

export type PostType =
  | "new_release"
  | "discussion"
  | "gig_event"
  | "collab_feedback"
  | "discovery";

export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";
export type ModerationStatus = "active" | "suspended" | "banned";

export type TrackMetadata = {
  platform: "spotify" | "youtube" | "soundcloud" | "apple_music" | "unknown";
  title: string;
  author?: string;
  thumbnail?: string;
  embed_url?: string;
  html?: string;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type UserModeration = {
  user_id: string;
  status: ModerationStatus;
  reason: string | null;
  banned_by: string | null;
  banned_at: string | null;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  post_type: PostType;
  body: string;
  track_url: string | null;
  track_metadata: TrackMetadata | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

export type PostWithAuthor = Post & {
  profiles: Pick<Profile, "username" | "display_name" | "avatar_url" | "role">;
};

export type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, "username" | "display_name" | "avatar_url">;
};

export type CurrentUser = Profile & {
  moderation: UserModeration | null;
};
