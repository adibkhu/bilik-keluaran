"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ postId }: { postId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("body", body);
    startTransition(async () => {
      const result = await createComment(postId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBody("");
      setError(null);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Join the discussion... Use @username to mention someone."
        required
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={pending || !body.trim()}>
        {pending ? "Posting..." : "Post comment"}
      </Button>
    </form>
  );
}
