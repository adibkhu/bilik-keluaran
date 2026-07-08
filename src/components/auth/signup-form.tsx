"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLE_LABELS, USERNAME_REGEX } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/types";

export function SignupForm({
  betaClosed,
  requiresInvite,
}: {
  betaClosed: boolean;
  requiresInvite: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("fan");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!USERNAME_REGEX.test(username)) {
      setError("Username must be 3–20 characters: lowercase letters, numbers, underscore.");
      return;
    }

    startTransition(async () => {
      if (betaClosed) {
        setError("Signups are currently closed for the beta.");
        return;
      }

      if (requiresInvite) {
        const response = await fetch("/api/beta/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode }),
        });
        if (!response.ok) {
          setError("Invalid invite code.");
          return;
        }
      }

      const supabase = createClient();

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existing) {
        setError("Username is already taken.");
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName || username,
            role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/feed");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {requiresInvite && (
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="invite">
            Invite code
          </label>
          <Input
            id="invite"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            required
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="username">
          Username
        </label>
        <Input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          pattern="[a-z0-9_]{3,20}"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="displayName">
          Display name
        </label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
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
        <label className="mb-1 block text-sm text-muted" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending || betaClosed}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
