import Link from "next/link";
import { splitTextWithMentions } from "@/lib/mentions";

export function MentionText({ text }: { text: string }) {
  const parts = splitTextWithMentions(text);

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) =>
        part.type === "mention" ? (
          <Link
            key={`${part.value}-${index}`}
            href={`/profile/${part.value}`}
            className="font-medium text-accent hover:underline"
          >
            @{part.value}
          </Link>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        ),
      )}
    </span>
  );
}
