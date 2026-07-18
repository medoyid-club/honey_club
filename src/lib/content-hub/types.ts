export type AuthorKey = "nata" | "tetiana";

export type IncomingTelegramPost = {
  sourceChannelId: string;
  sourceMessageId: number;
  text: string;
  hasMedia: boolean;
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
  blog_title_ru: string | null;
  blog_content_ru: string | null;
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
