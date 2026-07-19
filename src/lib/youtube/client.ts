type OAuthTokenFile = {
  refresh_token?: string;
};

type ClientSecretFile = {
  installed?: { client_id: string; client_secret: string };
  web?: { client_id: string; client_secret: string };
};

export async function readYoutubeOAuthCredentials(): Promise<{
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

export async function refreshYoutubeAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = await readYoutubeOAuthCredentials();

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

export async function youtubeApiGet<T>(pathSuffix: string, accessToken: string): Promise<T> {
  const url = `https://www.googleapis.com/youtube/v3/${pathSuffix}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`YouTube API error (${response.status}) for ${pathSuffix}`);
  }
  return response.json() as Promise<T>;
}

export type YoutubeVideoSnippet = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
};

export async function fetchChannelUploads(
  handle: string,
  accessToken: string,
  maxPages = 10
): Promise<YoutubeVideoSnippet[]> {
  const channel = await youtubeApiGet<{
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  }>(`channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}`, accessToken);

  const uploadsPlaylistId = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  const videoIds: string[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const suffix = pageToken
      ? `playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${pageToken}`
      : `playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`;

    const playlist = await youtubeApiGet<{
      items?: Array<{ contentDetails?: { videoId?: string } }>;
      nextPageToken?: string;
    }>(suffix, accessToken);

    for (const item of playlist.items ?? []) {
      const id = item.contentDetails?.videoId;
      if (id) videoIds.push(id);
    }

    pageToken = playlist.nextPageToken;
    if (!pageToken) break;
  }

  const results: YoutubeVideoSnippet[] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const joined = chunk.map(encodeURIComponent).join(",");
    const data = await youtubeApiGet<{
      items?: Array<{
        id: string;
        snippet?: {
          title?: string;
          description?: string;
          publishedAt?: string;
          tags?: string[];
        };
      }>;
    }>(`videos?part=snippet&id=${joined}`, accessToken);

    for (const item of data.items ?? []) {
      results.push({
        videoId: item.id,
        title: item.snippet?.title ?? "Видео",
        description: item.snippet?.description ?? "",
        publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
        tags: item.snippet?.tags ?? [],
      });
    }
  }

  return results;
}
