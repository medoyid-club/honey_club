import { normalizeYoutubeId } from "@/lib/youtube-id";
import { VIDEO_CATEGORY_DEFS, inferVideoCategorySlug } from "@/lib/youtube/categories";
import { videoMatchesAuthor } from "@/lib/youtube/author-match";
import {
  fetchChannelUploads,
  refreshYoutubeAccessToken,
  type YoutubeVideoSnippet,
} from "@/lib/youtube/client";
import { createServiceClient } from "@/lib/supabase/service";

export const CLUB_PRIMARY_YOUTUBE_HANDLE = "honey_erbe";
export const CLUB_PRIMARY_YOUTUBE_URL = "https://www.youtube.com/@honey_erbe";

export type AuthorVideosSyncResult = {
  authorSlug: string;
  scanned: number;
  matched: number;
  inserted: number;
  updated: number;
  skipped: number;
};

async function getAuthorPageId(slug: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("author_pages")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}

async function ensureCategory(pageId: string, slug: string): Promise<string | null> {
  const def = VIDEO_CATEGORY_DEFS.find((c) => c.slug === slug);
  if (!def) return null;

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("video_categories")
    .select("id")
    .eq("author_page_id", pageId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { count } = await supabase
    .from("video_categories")
    .select("id", { count: "exact", head: true })
    .eq("author_page_id", pageId);

  const { data: created } = await supabase
    .from("video_categories")
    .insert({
      author_page_id: pageId,
      slug: def.slug,
      name_ru: def.nameRu,
      name_uk: def.nameUk,
      name_en: def.nameEn,
      position: (count ?? 0) + 1,
    })
    .select("id")
    .single();

  return created?.id ?? null;
}

async function findExistingVideo(pageId: string, youtubeId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("videos")
    .select("id, youtube_id, title_ru, category_id, published_at")
    .eq("author_page_id", pageId)
    .eq("youtube_id", youtubeId)
    .maybeSingle();
  return data;
}

export async function syncAuthorVideosFromClubChannel(
  authorSlug: string,
  uploads?: YoutubeVideoSnippet[]
): Promise<AuthorVideosSyncResult> {
  const pageId = await getAuthorPageId(authorSlug);
  if (!pageId) {
    throw new Error(`Author page not found: ${authorSlug}`);
  }

  let items = uploads;
  if (!items) {
    const accessToken = await refreshYoutubeAccessToken();
    items = await fetchChannelUploads(CLUB_PRIMARY_YOUTUBE_HANDLE, accessToken);
  }

  const matchedVideos = items.filter((video) =>
    videoMatchesAuthor(authorSlug, {
      title: video.title,
      description: video.description,
      tags: video.tags,
    })
  );

  matchedVideos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const supabase = createServiceClient();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let index = 0; index < matchedVideos.length; index++) {
    const video = matchedVideos[index];
    const youtubeId = normalizeYoutubeId(video.videoId);
    if (!youtubeId) {
      skipped += 1;
      continue;
    }

    const categorySlug = inferVideoCategorySlug(
      `${video.title}\n${video.description}\n${video.tags.join(" ")}`
    );
    const categoryId = await ensureCategory(pageId, categorySlug);
    const publishedAt = video.publishedAt;
    const position = index + 1;

    const existing = await findExistingVideo(pageId, youtubeId);
    if (existing) {
      await supabase
        .from("videos")
        .update({
          title_ru: video.title,
          category_id: categoryId,
          published_at: publishedAt,
          position,
        })
        .eq("id", existing.id);
      updated += 1;
      continue;
    }

    const { error } = await supabase.from("videos").insert({
      author_page_id: pageId,
      category_id: categoryId,
      youtube_id: youtubeId,
      title_ru: video.title,
      published_at: publishedAt,
      position,
    });

    if (error) {
      if (error.code === "23505") {
        skipped += 1;
        continue;
      }
      console.error(`[youtube/sync] insert failed (${authorSlug}, ${youtubeId}):`, error.message);
      skipped += 1;
      continue;
    }

    inserted += 1;
  }

  return {
    authorSlug,
    scanned: items.length,
    matched: matchedVideos.length,
    inserted,
    updated,
    skipped,
  };
}

export async function syncAllAuthorVideosFromClubChannel(): Promise<AuthorVideosSyncResult[]> {
  const slugs = ["nata-ustymenko", "tetiana-gukalo"];
  const accessToken = await refreshYoutubeAccessToken();
  const uploads = await fetchChannelUploads(CLUB_PRIMARY_YOUTUBE_HANDLE, accessToken);

  const results: AuthorVideosSyncResult[] = [];
  for (const slug of slugs) {
    results.push(await syncAuthorVideosFromClubChannel(slug, uploads));
  }
  return results;
}
