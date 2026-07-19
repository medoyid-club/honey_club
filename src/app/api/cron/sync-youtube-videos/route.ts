import { NextResponse } from "next/server";

import { syncAllAuthorVideosFromClubChannel } from "@/lib/youtube/author-videos-sync";

export const runtime = "nodejs";
export const maxDuration = 120;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.YOUTUBE_SYNC_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllAuthorVideosFromClubChannel();
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[cron/sync-youtube-videos]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
