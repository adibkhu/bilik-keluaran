import type { TrackMetadata } from "@/lib/types";

type OEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
  provider_name?: string;
};

function detectPlatform(url: string): TrackMetadata["platform"] {
  const lower = url.toLowerCase();
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("soundcloud.com")) return "soundcloud";
  if (lower.includes("music.apple.com")) return "apple_music";
  return "unknown";
}

function getOEmbedEndpoint(url: string): string | null {
  const platform = detectPlatform(url);
  switch (platform) {
    case "spotify":
      return `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    case "youtube":
      return `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    case "soundcloud":
      return `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    default:
      return null;
  }
}

async function fetchOpenGraph(url: string): Promise<Partial<TrackMetadata>> {
  const response = await fetch(url, {
    headers: { "User-Agent": "BilikKeluaran/1.0" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return { platform: "unknown", title: url };
  }

  const html = await response.text();
  const title =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/i)?.[1] ??
    url;
  const thumbnail =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const author =
    html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1];

  return {
    platform: detectPlatform(url),
    title,
    thumbnail,
    author,
  };
}

export async function fetchTrackMetadata(url: string): Promise<TrackMetadata> {
  const platform = detectPlatform(url);
  const endpoint = getOEmbedEndpoint(url);

  if (endpoint) {
    try {
      const response = await fetch(endpoint, { next: { revalidate: 3600 } });
      if (response.ok) {
        const data = (await response.json()) as OEmbedResponse;
        return {
          platform,
          title: data.title ?? url,
          author: data.author_name,
          thumbnail: data.thumbnail_url,
          html: data.html,
          embed_url: data.html?.includes("iframe") ? url : undefined,
        };
      }
    } catch {
      // Fall through to Open Graph
    }
  }

  const og = await fetchOpenGraph(url);
  return {
    platform: og.platform ?? platform,
    title: og.title ?? url,
    author: og.author,
    thumbnail: og.thumbnail,
  };
}

export function isSupportedTrackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function getPlatformLabel(platform: TrackMetadata["platform"]): string {
  switch (platform) {
    case "spotify":
      return "Spotify";
    case "youtube":
      return "YouTube";
    case "soundcloud":
      return "SoundCloud";
    case "apple_music":
      return "Apple Music";
    default:
      return "Link";
  }
}
