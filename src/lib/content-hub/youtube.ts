import type { ClubYouTubeVideo } from "@/lib/content-hub/types";
import { CLUB_YOUTUBE_HANDLES } from "@/lib/content-hub/authors";

type OAuthTokenFile = {
  refresh_token?: string;
};

type ClientSecretFile = {
  installed?: { client_id: string; client_secret: string };
  web?: { client_id: string; client_secret: string };
};

type ChannelCache = Map<string, "honey_erbe" | "medoyid-club">;

let channelIdCache: ChannelCache | null = null;

async function readOAuthCredentials(): Promise<{
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}> {
  const envClientId = process.env.YOUTUBE_CLIENT_ID;
  const envClientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const envRefresh = process.env.YOUTUBE_REFRESH_TOKEN;

  if (envClientId && envClientSecret && envRefresh) {
    return {
      clientId: envClientId,
      clientSecret: envClientSecret,
      refreshToken: envRefresh,
    };
  }

  const fs = await import("node:fs");
  const path = await import("node:path");

  const tokenPath =
    process.env.YOUTUBE_TOKEN_FILE ??
    path.join(/* turbopackIgnore: true */ process.cwd(), "secrets", "youtube", "token.json");

  const tokenFile = JSON.parse(fs.readFileSync(tokenPath, "utf8")) as OAuthTokenFile;
  if (!tokenFile.refresh_token) {
    throw new Error("YouTube token.json missing refresh_token");
  }

  let secretPath = process.env.YOUTUBE_CLIENT_SECRET_FILE;
  if (!secretPath) {
    const dir = path.join(/* turbopackIgnore: true */ process.cwd(), "secrets", "youtube");
    const match = fs
      .readdirSync(dir)
      .find((name) => name.startsWith("client_secret") && name.endsWith(".json"));
    if (!match) throw new Error("YouTube client_secret*.json not found");
    secretPath = path.join(dir, match);
  }

  const raw = JSON.parse(fs.readFileSync(secretPath, "utf8")) as ClientSecretFile;
  const block = raw.installed ?? raw.web;
  if (!block?.client_id || !block.client_secret) {
    throw new Error("Invalid YouTube client secret file");
  }

  return {
    clientId: block.client_id,
    clientSecret: block.client_secret,
    refreshToken: tokenFile.refresh_token,
  };
}

async function refreshAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = await readOAuthCredentials();

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`YouTube token refresh failed (${response.status})`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("YouTube token refresh returned no access_token");
  }
  return data.access_token;
}

async function youtubeGet<T>(pathSuffix: string, accessToken: string): Promise<T> {
  const url = `https://www.googleapis.com/youtube/v3/${pathSuffix}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`YouTube API error (${response.status}) for ${pathSuffix}`);
  }
  return response.json() as Promise<T>;
}

async function getClubChannelIds(accessToken: string): Promise<ChannelCache> {
  if (channelIdCache) return channelIdCache;

  const map: ChannelCache = new Map();
  for (const handle of CLUB_YOUTUBE_HANDLES) {
    const data = await youtubeGet<{
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
    accessToken = await refreshAccessToken();
  } catch (err) {
    console.warn("[content-hub/youtube] OAuth unavailable:", err);
    return [];
  }

  const clubChannels = await getClubChannelIds(accessToken);
  if (!clubChannels.size) return [];

  const joined = videoIds.map(encodeURIComponent).join(",");
  const data = await youtubeGet<{
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
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

  const nataHints = ["ната", "nata", "устименко", "ustimenko", "philosophy by nata"];
  const tetianaHints = ["тетяна", "tetiana", "гукало", "gukalo"];

  if (nataHints.some((h) => lower.includes(h))) slugs.add("nata-ustymenko");
  if (tetianaHints.some((h) => lower.includes(h))) slugs.add("tetiana-gukalo");

  return [...slugs];
}
