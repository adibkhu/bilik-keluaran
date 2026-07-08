"use server";

import { extractMentionUsernames } from "@/lib/mentions";
import { fetchTrackMetadata, isSupportedTrackUrl } from "@/lib/oembed";
import { requireActiveUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PostType,
  ReportTargetType,
  ModerationStatus,
  UserRole,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

async function resolveMentionIds(usernames: string[]) {
  if (usernames.length === 0) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", usernames);
  return new Map((data ?? []).map((profile) => [profile.username, profile.id]));
}

async function insertMentions(
  usernames: string[],
  postId?: string,
  commentId?: string,
) {
  const mentionMap = await resolveMentionIds(usernames);
  if (mentionMap.size === 0) return;

  const supabase = await createClient();
  const rows = [...mentionMap.values()].map((mentionedUserId) => ({
    mentioned_user_id: mentionedUserId,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
  }));

  await supabase.from("mentions").insert(rows);
}

export async function createPost(formData: FormData) {
  const user = await requireActiveUser();
  const postType = formData.get("post_type") as PostType;
  const body = String(formData.get("body") ?? "").trim();
  const trackUrl = String(formData.get("track_url") ?? "").trim() || null;
  const imageUrls = formData.getAll("image_urls").map(String).filter(Boolean);

  if (!body) {
    return { error: "Post body is required." };
  }

  if (postType === "new_release" && !trackUrl) {
    return { error: "New Release posts require a track URL." };
  }

  if (trackUrl && !isSupportedTrackUrl(trackUrl)) {
    return { error: "Track URL must be a valid http(s) link." };
  }

  let trackMetadata = null;
  if (trackUrl) {
    try {
      trackMetadata = await fetchTrackMetadata(trackUrl);
    } catch {
      return { error: "Could not fetch track preview. Check the URL and try again." };
    }
  }

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      post_type: postType,
      body,
      track_url: trackUrl,
      track_metadata: trackMetadata,
      image_urls: imageUrls,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: error?.message ?? "Failed to create post." };
  }

  await insertMentions(extractMentionUsernames(body), post.id);
  revalidatePath("/feed");
  return { success: true, postId: post.id };
}

export async function createComment(postId: string, formData: FormData) {
  const user = await requireActiveUser();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { error: "Comment cannot be empty." };
  }

  const supabase = await createClient();
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body,
    })
    .select("id")
    .single();

  if (error || !comment) {
    return { error: error?.message ?? "Failed to post comment." };
  }

  await insertMentions(extractMentionUsernames(body), undefined, comment.id);
  revalidatePath(`/post/${postId}`);
  return { success: true };
}

export async function submitReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
) {
  const user = await requireActiveUser();
  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    return { error: "Please provide a reason for the report." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason: trimmedReason,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const user = await requireActiveUser();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const role = String(formData.get("role") ?? user.role) as UserRole;
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim() || null;

  if (!displayName) {
    return { error: "Display name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio,
      role,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/profile/${user.username}`);
  revalidatePath("/settings");
  return { success: true };
}

export async function adminDeletePost(postId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/feed");
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteComment(commentId: string, postId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return { error: error.message };
  revalidatePath(`/post/${postId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function adminUpdateReportStatus(
  reportId: string,
  status: "reviewed" | "dismissed" | "actioned",
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminModerateUser(
  userId: string,
  status: ModerationStatus,
  reason: string,
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("user_moderation").upsert({
    user_id: userId,
    status,
    reason: reason.trim() || null,
    banned_by: status === "active" ? null : admin.id,
    banned_at: status === "active" ? null : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}
