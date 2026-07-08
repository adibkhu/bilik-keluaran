import type { TrackMetadata } from "@/lib/types";

type OEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
  provider_name?: string;
};

const ALLOWED_HOSTS = [
  "open.spotify.com",
  "spotify.com",
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "m.youtube.com",
  "soundcloud.com",
  "www.soundcloud.com",
  "on.soundcloud.com",
  "music.apple.com",
] as const;

function hostnameAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

export function detectPlatform(url: string): TrackMetadata["platform"] {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("spotify.com")) return "spotify";
    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("soundcloud.com")) return "soundcloud";
    if (host.includes("music.apple.com")) return "apple_music";
  } catch {
    return "unknown";
  }
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

function appleMusicEmbedFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("music.apple.com")) return undefined;
    // https://embed.music.apple.com/{country}/album/... or /song/...
    return `https://embed.music.apple.com${parsed.pathname}${parsed.search}`;
  } catch {
    return undefined;
  }
}

async function fetchOpenGraph(url: string): Promise<Partial<TrackMetadata>> {
  const response = await fetch(url, {
    headers: { "User-Agent": "BilikKeluaran/1.0" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    return { platform: detectPlatform(url), title: url };
  }

  const html = await response.text();
  const title =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/i)?.[1] ??
    url;
  const thumbnail =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const author =
    html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+property=["']music:musician["'][^>]+content=["']([^"']+)["']/i)?.[1];

  return {
    platform: detectPlatform(url),
    title,
    thumbnail,
    author,
  };
}

export function isSupportedTrackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    return hostnameAllowed(parsed.hostname);
  } catch {
    return false;
  }
}

export async function fetchTrackMetadata(url: string): Promise<TrackMetadata> {
  if (!isSupportedTrackUrl(url)) {
    throw new Error("Unsupported track URL. Use Spotify, YouTube, SoundCloud, or Apple Music.");
  }

  const platform = detectPlatform(url);
  const endpoint = getOEmbedEndpoint(url);

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const data = (await response.json()) as OEmbedResponse;
        return {
          platform,
          title: data.title ?? url,
          author: data.author_name,
          thumbnail: data.thumbnail_url,
          // Only keep HTML from known oEmbed providers
          html: data.html,
          embed_url: url,
        };
      }
    } catch {
      // Fall through
    }
  }

  if (platform === "apple_music") {
    const og = await fetchOpenGraph(url);
    return {
      platform: "apple_music",
      title: og.title ?? "Apple Music",
      author: og.author,
      thumbnail: og.thumbnail,
      embed_url: appleMusicEmbedFromUrl(url),
    };
  }

  const og = await fetchOpenGraph(url);
  return {
    platform: og.platform ?? platform,
    title: og.title ?? url,
    author: og.author,
    thumbnail: og.thumbnail,
    embed_url: url,
  };
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
