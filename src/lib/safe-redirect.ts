/** Safe internal path only — blocks open redirects. */
export function safeNextPath(next: string | null | undefined, fallback = "/feed"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.includes("://")) return fallback;
  return next;
}
