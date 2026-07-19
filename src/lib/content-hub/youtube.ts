import type { ClubYouTubeVideo } from "@/lib/content-hub/types";
import { CLUB_YOUTUBE_HANDLES } from "@/lib/content-hub/authors";
import {
  fetchChannelUploads,
  refreshYoutubeAccessToken,
  youtubeApiGet,
} from "@/lib/youtube/client";

type ChannelCache = Map<string, "honey_erbe" | "medoyid-club">;

let channelIdCache: ChannelCache | null = null;

async function getClubChannelIds(accessToken: string): Promise<ChannelCache> {
  if (channelIdCache) return channelIdCache;

  const map: ChannelCache = new Map();
  for (const handle of CLUB_YOUTUBE_HANDLES) {
    const data = await youtubeApiGet<{
      items?: Array<{ id: string }>;
    }>(`channels?part=id&forHandle=${encodeURIComponent(handle)}`, accessToken);
    const id = data.items?.[0]?.id;
    if (id) map.set(id, handle);
  }

  channelIdCache = map;
  return map;
}

export async function fetchClubYoutubeVideos(
  videoIds: string[]
): Promise<ClubYouTubeVideo[]> {
  if (!videoIds.length) return [];

  let accessToken: string;
  try {
    accessToken = await refreshYoutubeAccessToken();
  } catch (err) {
    console.warn("[content-hub/youtube] OAuth unavailable:", err);
    return [];
  }

  const clubChannels = await getClubChannelIds(accessToken);
  if (!clubChannels.size) return [];

  const joined = videoIds.map(encodeURIComponent).join(",");
  const data = await youtubeApiGet<{
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
        publishedAt?: string;
        tags?: string[];
      };
    }>;
  }>(`videos?part=snippet&id=${joined}`, accessToken);

  const results: ClubYouTubeVideo[] = [];
  const seen = new Set<string>();
  for (const item of data.items ?? []) {
    const channelId = item.snippet?.channelId;
    if (!channelId) continue;
    const handle = clubChannels.get(channelId);
    if (!handle) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    results.push({
      videoId: item.id,
      title: item.snippet?.title ?? "Видео",
      description: item.snippet?.description ?? "",
      channelHandle: handle,
      publishedAt: item.snippet?.publishedAt ?? null,
      tags: item.snippet?.tags ?? [],
    });
  }

  return results;
}

export function detectAuthorsFromDescription(
  description: string,
  sourceAuthorSlug: string
): string[] {
  const lower = description.toLowerCase();
  const slugs = new Set<string>([sourceAuthorSlug]);

  const nataHints = ["ната", "nata", "устименко", "ustimenko", "ustymenko", "philosophy by nata"];
  const tetianaHints = ["тетяна", "tetiana", "гукало", "gukalo"];

  if (nataHints.some((h) => lower.includes(h))) slugs.add("nata-ustymenko");
  if (tetianaHints.some((h) => lower.includes(h))) slugs.add("tetiana-gukalo");

  return [...slugs];
}

export { fetchChannelUploads, refreshYoutubeAccessToken };
