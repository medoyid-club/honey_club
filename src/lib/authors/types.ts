import type { Locale } from "@/i18n/routing";

export type AuthorSocialPlatform =
  | "youtube"
  | "telegram"
  | "facebook"
  | "instagram"
  | "email"
  | "mono";

export type AuthorSocialLink = {
  platform: AuthorSocialPlatform;
  href: string;
  label: string;
};

export type AuthorVideoCategory = "philosophy" | "psychology" | "society";

export type AuthorVideo = {
  id: string;
  category: AuthorVideoCategory;
  youtubeId?: string;
  title: Record<Locale, string>;
  publishedAt: string;
};

export type AuthorBlogPost = {
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  publishedAt: string;
  readingMinutes: number;
};

export type AuthorProfile = {
  slug: string;
  name: Record<Locale, string>;
  role: Record<Locale, string>;
  photo: string;
  social: AuthorSocialLink[];
  bio: Record<Locale, string>;
  /** Match courses.author_name in Supabase */
  courseAuthorName?: string;
  blogPosts: AuthorBlogPost[];
  videos: AuthorVideo[];
};
