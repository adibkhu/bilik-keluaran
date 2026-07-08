import type { PostType, UserRole } from "@/lib/types";

export const SITE_NAME = "Bilik Keluaran";
export const SITE_TAGLINE =
  "A Malaysian music community for producers, fans, and the local scene.";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  new_release: "New Release",
  discussion: "Discussion",
  gig_event: "Gig / Event",
  collab_feedback: "Collab / Feedback",
  discovery: "Discovery",
};

export const POST_TYPE_DESCRIPTIONS: Record<PostType, string> = {
  new_release: "Share a track from Spotify, YouTube, SoundCloud, or Apple Music.",
  discussion: "Talk production, scene news, gear, or anything music-related.",
  gig_event: "Promote or discuss gigs, festivals, and events.",
  collab_feedback: "Find collaborators or ask for feedback on your work.",
  discovery: "Recommend artists, labels, or sounds from the local scene.",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  fan: "Fan",
  producer: "Producer",
  artist: "Artist",
};

export const REPORT_REASONS = [
  "Explicit or sexual content",
  "Harassment or hate speech",
  "Spam or impersonation",
  "Off-topic / not music-related",
  "Other",
] as const;

export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
