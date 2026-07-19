import type { Locale } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public";
import type { AuthorSocialLink, AuthorSocialPlatform } from "@/lib/authors/types";
import { extractYoutubeIdsFromText, youtubeThumbnailUrl } from "@/lib/youtube-id";

export type SocialEntry = { platform: AuthorSocialPlatform; url: string };

export type AuthorPageRow = {
  id: string;
  profile_id: string | null;
  claim_email: string | null;
  slug: string;
  display_name: string | null;
  headline_ru: string | null;
  headline_uk: string | null;
  headline_en: string | null;
  slogan_ru: string | null;
  slogan_uk: string | null;
  slogan_en: string | null;
  bio_ru: string | null;
  bio_uk: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  socials: SocialEntry[] | null;
  contacts: Record<string, string> | null;
  published: boolean;
};

export type BlogPostRow = {
  id: string;
  author_page_id: string;
  slug: string;
  title_ru: string;
  title_uk: string | null;
  title_en: string | null;
  excerpt_ru: string | null;
  excerpt_uk: string | null;
  excerpt_en: string | null;
  content_ru: string | null;
  content_uk: string | null;
  content_en: string | null;
  cover_url: string | null;
  reading_minutes: number;
  published: boolean;
  published_at: string | null;
};

export type VideoCategoryRow = {
  id: string;
  author_page_id: string;
  slug: string;
  name_ru: string;
  name_uk: string | null;
  name_en: string | null;
  position: number;
};

export type VideoRow = {
  id: string;
  author_page_id: string;
  category_id: string | null;
  youtube_id: string;
  title_ru: string;
  title_uk: string | null;
  title_en: string | null;
  published_at: string | null;
  position: number;
};

export function pick(
  locale: Locale,
  ru: string | null,
  uk: string | null,
  en: string | null
): string {
  if (locale === "uk") return uk ?? ru ?? en ?? "";
  if (locale === "en") return en ?? uk ?? ru ?? "";
  return ru ?? uk ?? en ?? "";
}

type BlogCoverSource = {
  cover_url: string | null;
  content_ru?: string | null;
  content_uk?: string | null;
  content_en?: string | null;
};

/** Use stored cover, or fall back to the first YouTube thumbnail linked in post content. */
export function blogCoverFromPost(post: BlogCoverSource): string | null {
  if (post.cover_url) return post.cover_url;
  const videoId = extractYoutubeIdsFromText(
    post.content_ru,
    post.content_uk,
    post.content_en
  )[0];
  return videoId ? youtubeThumbnailUrl(videoId, "maxresdefault") : null;
}

const SOCIAL_LABELS: Record<AuthorSocialPlatform, string> = {
  youtube: "YouTube",
  telegram: "Telegram",
  facebook: "Facebook",
  instagram: "Instagram",
  email: "Email",
  mono: "Monobank",
};

export function toSocialLinks(socials: SocialEntry[] | null): AuthorSocialLink[] {
  if (!Array.isArray(socials)) return [];
  return socials
    .filter((s) => s && s.platform && s.url)
    .map((s) => ({
      platform: s.platform,
      href: s.url,
      label: SOCIAL_LABELS[s.platform] ?? s.platform,
    }));
}

export function authorYoutubeChannel(socials: SocialEntry[] | null): string | null {
  if (!Array.isArray(socials)) return null;
  return socials.find((s) => s.platform === "youtube")?.url ?? null;
}

export async function getPublishedAuthorPages(): Promise<AuthorPageRow[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("author_pages")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  return (data as AuthorPageRow[] | null) ?? [];
}

export async function getPublishedAuthorPageBySlug(
  slug: string
): Promise<AuthorPageRow | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("author_pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as AuthorPageRow | null) ?? null;
}

export async function getPublishedAuthorSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("author_pages")
    .select("slug")
    .eq("published", true);
  return ((data as { slug: string }[] | null) ?? []).map((r) => r.slug);
}

export async function getPublishedBlogPosts(
  authorPageId: string
): Promise<BlogPostRow[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("author_page_id", authorPageId)
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data as BlogPostRow[] | null) ?? [];
}

export async function getPublishedBlogPost(
  authorPageId: string,
  postSlug: string
): Promise<BlogPostRow | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("author_page_id", authorPageId)
    .eq("slug", postSlug)
    .eq("published", true)
    .maybeSingle();
  return (data as BlogPostRow | null) ?? null;
}

export async function getVideoCategories(
  authorPageId: string
): Promise<VideoCategoryRow[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("video_categories")
    .select("*")
    .eq("author_page_id", authorPageId)
    .order("position", { ascending: true });
  return (data as VideoCategoryRow[] | null) ?? [];
}

export async function getVideos(authorPageId: string): Promise<VideoRow[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("author_page_id", authorPageId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("position", { ascending: true });
  return (data as VideoRow[] | null) ?? [];
}

export function youtubeWatchUrl(youtubeId: string): string | null {
  const id = youtubeId?.trim();
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}
