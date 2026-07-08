const USERNAME_PATTERN = /@([a-z0-9_]{3,20})/g;

export function extractMentionUsernames(text: string): string[] {
  const matches = text.matchAll(USERNAME_PATTERN);
  return [...new Set([...matches].map((match) => match[1]))];
}

export function splitTextWithMentions(
  text: string,
): Array<{ type: "text" | "mention"; value: string }> {
  const parts: Array<{ type: "text" | "mention"; value: string }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(USERNAME_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "mention", value: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}
