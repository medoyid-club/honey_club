export type AuthorKey = "nata" | "tetiana";

export type ContentLocale = "ru" | "uk" | "en";

export type IncomingTelegramPost = {
  sourceChannelId: string;
  sourceMessageId: number;
  text: string;
  hasMedia: boolean;
  photoFileId: string | null;
  rawUrls: string[];
};

export type ClubYouTubeVideo = {
  videoId: string;
  title: string;
  description: string;
  channelHandle: "honey_erbe" | "medoyid-club";
};

export type GeminiHubResult = {
  approved: boolean;
  reject_reason: string | null;
  content_type: "blog" | "video" | "announcement" | "mixed";
  telegram_html: string;
  /** Primary language of the author's post — title and body must match this locale */
  blog_locale: ContentLocale;
  blog_title: string | null;
  blog_excerpt: string | null;
  blog_content: string | null;
  tags: string[];
  video_author_slugs: string[];
};

export type PipelineResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  clubMessageId?: number;
  blogPostId?: string;
  videoIds?: string[];
};
