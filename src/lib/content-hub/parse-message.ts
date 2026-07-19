import { uniqueYoutubeIds } from "@/lib/youtube-id";
import { CLUB_YOUTUBE_HANDLES } from "@/lib/content-hub/authors";
import type { IncomingTelegramPost } from "@/lib/content-hub/types";

export type TelegramChannelPost = {
  message_id: number;
  text?: string;
  caption?: string;
  photo?: Array<{ file_id: string; file_size?: number }>;
  video?: unknown;
  document?: unknown;
  audio?: unknown;
  voice?: unknown;
  entities?: Array<{ type: string; offset: number; length: number; url?: string }>;
};

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

export function extractUrls(text: string, entities?: TelegramChannelPost["entities"]): string[] {
  const found = new Set<string>();

  for (const match of text.matchAll(URL_RE)) {
    found.add(match[0].replace(/[.,;:!?)]+$/, ""));
  }

  if (entities) {
    for (const entity of entities) {
      if (entity.type === "text_link" && entity.url) {
        found.add(entity.url);
      }
    }
  }

  return [...found];
}

export function parseChannelPost(
  chatId: string,
  message: TelegramChannelPost
): IncomingTelegramPost {
  const text = (message.text ?? message.caption ?? "").trim();
  const hasMedia = Boolean(
    message.photo?.length || message.video || message.document || message.audio || message.voice
  );
  const photoFileId =
    message.photo?.length ? message.photo[message.photo.length - 1].file_id : null;

  return {
    sourceChannelId: String(chatId),
    sourceMessageId: message.message_id,
    text,
    hasMedia,
    photoFileId,
    rawUrls: extractUrls(text, message.entities),
  };
}

export function extractYoutubeVideoIds(urls: string[]): string[] {
  return uniqueYoutubeIds(urls);
}

export function isClubYoutubeUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.includes("youtu.be/") || lower.includes("youtube.com/watch")) return true;
  return CLUB_YOUTUBE_HANDLES.some((h) => lower.includes(`youtube.com/@${h}`));
}
