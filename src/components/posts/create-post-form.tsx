"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/actions";
import {
  POST_TYPE_DESCRIPTIONS,
  POST_TYPE_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PostType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const postTypes = Object.keys(POST_TYPE_LABELS) as PostType[];

export function CreatePostForm() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>("discussion");
  const [body, setBody] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function uploadImages(files: FileList | null): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to upload images.");

    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, file, { upsert: false });
      if (uploadError) {
        throw new Error(uploadError.message || "Image upload failed.");
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(path);
      urls.push(publicUrl);
    }
    return urls;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const imageUrls = await uploadImages(imageFiles);
        const formData = new FormData();
        formData.set("post_type", postType);
        formData.set("body", body);
        if (trackUrl.trim()) formData.set("track_url", trackUrl.trim());
        imageUrls.forEach((url) => formData.append("image_urls", url));

        const result = await createPost(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push(result.postId ? `/post/${result.postId}` : "/feed");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Post type
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {postTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                postType === type
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-border/80"
              }`}
            >
              <p className="text-sm font-semibold">{POST_TYPE_LABELS[type]}</p>
              <p className="mt-1 text-xs text-muted">
                {POST_TYPE_DESCRIPTIONS[type]}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="body">
          What&apos;s on your mind?
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share your release, ask for feedback, or talk about the scene. Use @username to mention someone."
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="trackUrl">
          Track URL {postType === "new_release" ? "(required)" : "(optional)"}
        </label>
        <Input
          id="trackUrl"
          type="url"
          value={trackUrl}
          onChange={(event) => setTrackUrl(event.target.value)}
          placeholder="https://open.spotify.com/track/..."
          required={postType === "new_release"}
        />
        <p className="mt-1 text-xs text-muted">
          Spotify, YouTube, SoundCloud, or Apple Music links supported.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="images">
          Images (optional, up to 4)
        </label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setImageFiles(event.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={pending || !body.trim()}>
        {pending ? "Publishing..." : "Publish post"}
      </Button>
    </form>
  );
}
