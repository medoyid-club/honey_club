import { slugify } from "@/lib/slug";
import { normalizeYoutubeId, extractYoutubeIdsFromText } from "@/lib/youtube-id";
import { inferVideoCategorySlug } from "@/lib/youtube/categories";
import { findAuthorBySlug } from "@/lib/content-hub/authors";
import { detectLocaleFromText } from "@/lib/content-hub/detect-locale";
import { resolveBlogCoverUrl } from "@/lib/content-hub/media";
import type { ClubYouTubeVideo, ContentLocale, GeminiHubResult, IncomingTelegramPost } from "@/lib/content-hub/types";
import { createServiceClient } from "@/lib/supabase/service";

function blogLocaleFields(
  locale: ContentLocale,
  title: string,
  excerpt: string | null,
  content: string
): Record<string, string | null> {
  const fields: Record<string, string | null> = {
    title_ru: null,
    title_uk: null,
    title_en: null,
    excerpt_ru: null,
    excerpt_uk: null,
    excerpt_en: null,
    content_ru: null,
    content_uk: null,
    content_en: null,
  };

  const prefix = locale === "uk" ? "uk" : locale === "en" ? "en" : "ru";
  fields[`title_${prefix}`] = title;
  fields[`excerpt_${prefix}`] = excerpt;
  fields[`content_${prefix}`] = content;
  return fields;
}

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

async function ensureVideoCategory(pageId: string, categorySlug: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("video_categories")
    .select("id")
    .eq("author_page_id", pageId)
    .eq("slug", categorySlug)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const names: Record<string, { ru: string; uk: string; en: string }> = {
    philosophy: { ru: "Философия", uk: "Філософія", en: "Philosophy" },
    psychology: { ru: "Психология", uk: "Психологія", en: "Psychology" },
    society: { ru: "Общество", uk: "Суспільство", en: "Society" },
    interviews: { ru: "Интервью", uk: "Інтерв'ю", en: "Interviews" },
    "content-hub": { ru: "Контент-хаб", uk: "Контент-хаб", en: "Content hub" },
  };
  const label = names[categorySlug] ?? names["content-hub"];

  const { count } = await supabase
    .from("video_categories")
    .select("id", { count: "exact", head: true })
    .eq("author_page_id", pageId);

  const { data: created } = await supabase
    .from("video_categories")
    .insert({
      author_page_id: pageId,
      slug: categorySlug,
      name_ru: label.ru,
      name_uk: label.uk,
      name_en: label.en,
      position: (count ?? 0) + 1,
    })
    .select("id")
    .single();

  return created?.id ?? null;
}

async function ensureDefaultVideoCategory(pageId: string): Promise<string | null> {
  return ensureVideoCategory(pageId, "content-hub");
}

function firstMeaningfulLine(text: string): string {
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (trimmed.length >= 20) return trimmed.slice(0, 120);
  }
  return text.trim().slice(0, 120) || "Статья";
}

function resolveBlogFields(
  gemini: GeminiHubResult,
  post: IncomingTelegramPost
): {
  locale: ContentLocale;
  title: string;
  content: string;
  excerpt: string;
} | null {
  const sourceText = post.text.trim();
  if (!sourceText) return null;

  const content = gemini.blog_content?.trim() || sourceText;
  if (content.length < 40) return null;

  const locale = gemini.blog_locale ?? detectLocaleFromText(sourceText);
  const title = gemini.blog_title?.trim() || firstMeaningfulLine(sourceText);
  const excerpt = gemini.blog_excerpt?.trim() || content.slice(0, 280);

  return { locale, title, content, excerpt };
}

export async function syncBlogPost(params: {
  authorSlug: string;
  gemini: GeminiHubResult;
  post: IncomingTelegramPost;
  clubYoutubeIds: string[];
}): Promise<string | null> {
  const { authorSlug, gemini, post, clubYoutubeIds } = params;
  const blog = resolveBlogFields(gemini, post);
  if (!blog) return null;

  const pageId = await getAuthorPageId(authorSlug);
  if (!pageId) {
    console.warn(`[content-hub] Author page not found for slug ${authorSlug}`);
    return null;
  }

  const coverUrl = await resolveBlogCoverUrl({
    authorPageId: pageId,
    photoFileId: post.photoFileId,
    rawUrls: post.rawUrls,
    clubYoutubeIds,
  });

  const supabase = createServiceClient();
  const slug = await uniqueBlogSlug(pageId, blog.title);
  const words = blog.content.trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));
  let blogContent = blog.content;
  const youtubeIds = extractYoutubeIdsFromText(blogContent, ...post.rawUrls, ...clubYoutubeIds);
  const primaryYoutubeId = youtubeIds[0];
  if (primaryYoutubeId && !blogContent.includes(primaryYoutubeId)) {
    blogContent = `${blogContent.trim()}\n\nhttps://www.youtube.com/watch?v=${primaryYoutubeId}`;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      author_page_id: pageId,
      slug,
      ...blogLocaleFields(blog.locale, blog.title, blog.excerpt, blogContent),
      cover_url: coverUrl,
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

    for (const video of clubVideos) {
      const categorySlug = inferVideoCategorySlug(
        `${video.title}\n${video.description}\n${video.tags.join(" ")}`
      );
      const categoryId = await ensureVideoCategory(pageId, categorySlug);

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
          published_at: video.publishedAt ?? new Date().toISOString(),
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
