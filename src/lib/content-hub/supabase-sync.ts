import { slugify } from "@/lib/slug";
import { normalizeYoutubeId } from "@/lib/youtube-id";
import { findAuthorBySlug } from "@/lib/content-hub/authors";
import type { ClubYouTubeVideo, GeminiHubResult } from "@/lib/content-hub/types";
import { createServiceClient } from "@/lib/supabase/service";

async function getAuthorPageId(slug: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("author_pages")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}

async function uniqueBlogSlug(pageId: string, base: string): Promise<string> {
  const supabase = createServiceClient();
  let slug = slugify(base) || "post";
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("author_page_id", pageId)
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${slugify(base)}-${i + 2}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

async function ensureDefaultVideoCategory(pageId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("video_categories")
    .select("id")
    .eq("author_page_id", pageId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created } = await supabase
    .from("video_categories")
    .insert({
      author_page_id: pageId,
      slug: "content-hub",
      name_ru: "Контент-хаб",
      position: 1,
    })
    .select("id")
    .single();

  return created?.id ?? null;
}

export async function syncBlogPost(params: {
  authorSlug: string;
  gemini: GeminiHubResult;
}): Promise<string | null> {
  const { authorSlug, gemini } = params;
  if (!gemini.blog_title_ru || !gemini.blog_content_ru) return null;
  if (gemini.content_type === "video") return null;

  const pageId = await getAuthorPageId(authorSlug);
  if (!pageId) {
    console.warn(`[content-hub] Author page not found for slug ${authorSlug}`);
    return null;
  }

  const supabase = createServiceClient();
  const slug = await uniqueBlogSlug(pageId, gemini.blog_title_ru);
  const words = gemini.blog_content_ru.trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      author_page_id: pageId,
      slug,
      title_ru: gemini.blog_title_ru,
      excerpt_ru: gemini.blog_content_ru.slice(0, 280),
      content_ru: gemini.blog_content_ru,
      reading_minutes: readingMinutes,
      published: true,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[content-hub] blog insert failed:", error.message);
    return null;
  }

  return data?.id ?? null;
}

async function videoExistsForAuthor(
  pageId: string,
  youtubeId: string
): Promise<{ exists: boolean; existingId?: string }> {
  const normalized = normalizeYoutubeId(youtubeId);
  if (!normalized) return { exists: false };

  const supabase = createServiceClient();

  const { data: exact } = await supabase
    .from("videos")
    .select("id")
    .eq("author_page_id", pageId)
    .eq("youtube_id", normalized)
    .maybeSingle();

  if (exact?.id) return { exists: true, existingId: exact.id };

  // Legacy rows may store a full URL instead of the bare id
  const { data: legacyRows } = await supabase
    .from("videos")
    .select("id, youtube_id")
    .eq("author_page_id", pageId)
    .ilike("youtube_id", `%${normalized}%`);

  for (const row of legacyRows ?? []) {
    if (normalizeYoutubeId(row.youtube_id) === normalized) {
      return { exists: true, existingId: row.id };
    }
  }

  return { exists: false };
}

export async function syncClubVideos(params: {
  clubVideos: ClubYouTubeVideo[];
  authorSlugs: string[];
}): Promise<string[]> {
  const { clubVideos, authorSlugs } = params;
  if (!clubVideos.length) return [];

  const supabase = createServiceClient();
  const inserted: string[] = [];

  for (const slug of authorSlugs) {
    if (!findAuthorBySlug(slug)) continue;
    const pageId = await getAuthorPageId(slug);
    if (!pageId) continue;

    const categoryId = await ensureDefaultVideoCategory(pageId);

    for (const video of clubVideos) {
      const youtubeId = normalizeYoutubeId(video.videoId);
      if (!youtubeId) {
        console.warn(`[content-hub] Invalid YouTube id: ${video.videoId}`);
        continue;
      }

      const { exists, existingId } = await videoExistsForAuthor(pageId, youtubeId);
      if (exists) {
        console.info(
          `[content-hub] Video ${youtubeId} already in videoteka (${slug}, id=${existingId}), skip`
        );
        continue;
      }

      const { count } = await supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("author_page_id", pageId);

      const { data, error } = await supabase
        .from("videos")
        .insert({
          author_page_id: pageId,
          category_id: categoryId,
          youtube_id: youtubeId,
          title_ru: video.title,
          published_at: new Date().toISOString(),
          position: (count ?? 0) + 1,
        })
        .select("id")
        .single();

      if (error) {
        // Unique index race: treat as duplicate
        if (error.code === "23505") {
          console.info(`[content-hub] Video ${youtubeId} duplicate (${slug}), skip`);
          continue;
        }
        console.error(`[content-hub] video insert failed (${slug}):`, error.message);
        continue;
      }
      if (data?.id) inserted.push(data.id);
    }
  }

  return inserted;
}

export async function wasMessageProcessed(
  sourceChannelId: string,
  sourceMessageId: number
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("content_hub_processed")
    .select("id")
    .eq("source_channel_id", sourceChannelId)
    .eq("source_message_id", sourceMessageId)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function markMessageProcessed(params: {
  sourceChannelId: string;
  sourceMessageId: number;
  authorSlug: string;
  status: "published" | "rejected" | "error";
  clubMessageId?: number;
  rejectReason?: string;
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("content_hub_processed").insert({
    source_channel_id: params.sourceChannelId,
    source_message_id: params.sourceMessageId,
    author_slug: params.authorSlug,
    status: params.status,
    club_message_id: params.clubMessageId ?? null,
    reject_reason: params.rejectReason ?? null,
  });
}
