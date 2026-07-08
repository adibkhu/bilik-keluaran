"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleAvatarUpload(file: File | undefined) {
    if (!file) return;
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("display_name", displayName);
      formData.set("bio", bio);
      formData.set("role", role);
      formData.set("avatar_url", avatarUrl);
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
        setSuccess(false);
        return;
      }
      setError(null);
      setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="avatar">
          Avatar
        </label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(event) =>
            handleAvatarUpload(event.target.files?.[0])
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Username</label>
        <Input value={profile.username} disabled />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="displayName">
          Display name
        </label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as Profile["role"])
          }
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
        >
          {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="bio">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell the community about your sound, city, or what you're working on."
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400">Profile updated.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
