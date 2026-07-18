import { uniqueYoutubeIds } from "@/lib/youtube-id";
import { CLUB_YOUTUBE_HANDLES } from "@/lib/content-hub/authors";
import type { IncomingTelegramPost } from "@/lib/content-hub/types";

type TelegramMessage = {
  message_id: number;
  text?: string;
  caption?: string;
  photo?: unknown[];
  video?: unknown;
  document?: unknown;
  audio?: unknown;
  voice?: unknown;
  entities?: Array<{ type: string; offset: number; length: number; url?: string }>;
};

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

export function extractUrls(text: string, entities?: TelegramMessage["entities"]): string[] {
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
  message: TelegramMessage
): IncomingTelegramPost {
  const text = (message.text ?? message.caption ?? "").trim();
  const hasMedia = Boolean(
    message.photo || message.video || message.document || message.audio || message.voice
  );

  return {
    sourceChannelId: String(chatId),
    sourceMessageId: message.message_id,
    text,
    hasMedia,
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
