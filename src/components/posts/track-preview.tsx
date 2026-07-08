import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Music2 } from "lucide-react";
import type { TrackMetadata } from "@/lib/types";
import { getPlatformLabel } from "@/lib/oembed";
import { Card } from "@/components/ui/card";

type TrackPreviewProps = {
  url: string;
  metadata: TrackMetadata | null;
};

function platformEmbedSrc(url: string, metadata: TrackMetadata): string | null {
  if (metadata.platform === "apple_music" && metadata.embed_url?.includes("embed.music.apple.com")) {
    return metadata.embed_url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("spotify.com")) {
      // /track/ID → /embed/track/ID
      const path = parsed.pathname.replace(/^\/(intl-[^/]+\/)?/, "/");
      return `https://open.spotify.com/embed${path}`;
    }

    if (host.includes("youtu.be") || host.includes("youtube.com")) {
      let videoId = "";
      if (host.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      } else {
        videoId = parsed.searchParams.get("v") ?? "";
      }
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host.includes("soundcloud.com") && metadata.html) {
      const match = metadata.html.match(/src=["']([^"']+)["']/i);
      return match?.[1] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export function TrackPreview({ url, metadata }: TrackPreviewProps) {
  if (!metadata) {
    return (
      <Card className="flex items-center gap-3 bg-bg/50 p-3">
        <Music2 className="h-5 w-5 text-muted" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm text-accent hover:underline"
        >
          {url}
        </a>
      </Card>
    );
  }

  const embedSrc = platformEmbedSrc(url, metadata);
  const iframeHeight =
    metadata.platform === "youtube"
      ? "200"
      : metadata.platform === "apple_music"
        ? "175"
        : "152";

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex gap-3 p-3">
        {metadata.thumbnail ? (
          <Image
            src={metadata.thumbnail}
            alt={metadata.title}
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
            <Music2 className="h-8 w-8 text-muted" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {metadata.title}
          </p>
          {metadata.author && (
            <p className="truncate text-xs text-muted">{metadata.author}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-muted">
              {getPlatformLabel(metadata.platform)}
            </span>
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Open <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
      {embedSrc && (
        <div className="border-t border-border">
          <iframe
            title={metadata.title}
            src={embedSrc}
            className="w-full"
            height={iframeHeight}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </Card>
  );
}
