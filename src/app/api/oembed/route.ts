import { NextResponse } from "next/server";
import { fetchTrackMetadata, isSupportedTrackUrl } from "@/lib/oembed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !isSupportedTrackUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const metadata = await fetchTrackMetadata(url);
    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json(
      { error: "Could not fetch track metadata" },
      { status: 502 },
    );
  }
}
