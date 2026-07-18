import {
  findAuthorByChannelId,
  getClubChannelId,
} from "@/lib/content-hub/authors";
import { formatRejectLog, processPostWithGemini } from "@/lib/content-hub/gemini-process";
import {
  extractYoutubeVideoIds,
  parseChannelPost,
} from "@/lib/content-hub/parse-message";
import {
  markMessageProcessed,
  syncBlogPost,
  syncClubVideos,
  wasMessageProcessed,
} from "@/lib/content-hub/supabase-sync";
import { publishToClubChannel } from "@/lib/content-hub/telegram-api";
import type { PipelineResult } from "@/lib/content-hub/types";
import {
  detectAuthorsFromDescription,
  fetchClubYoutubeVideos,
} from "@/lib/content-hub/youtube";

type TelegramChannelPost = {
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

export async function runContentHubPipeline(
  chatId: string,
  message: TelegramChannelPost
): Promise<PipelineResult> {
  const author = findAuthorByChannelId(chatId);
  if (!author) {
    return { ok: false, skipped: true, reason: "unknown_channel" };
  }

  const post = parseChannelPost(chatId, message);

  if (await wasMessageProcessed(post.sourceChannelId, post.sourceMessageId)) {
    return { ok: true, skipped: true, reason: "duplicate" };
  }

  const youtubeIds = extractYoutubeVideoIds(post.rawUrls);
  let clubVideos = await fetchClubYoutubeVideos(youtubeIds);

  // Enrich author slugs for videos from YouTube descriptions
  const videoAuthorSlugs = new Set<string>([author.slug]);
  for (const video of clubVideos) {
    for (const slug of detectAuthorsFromDescription(video.description, author.slug)) {
      videoAuthorSlugs.add(slug);
    }
  }

  let gemini;
  try {
    gemini = await processPostWithGemini(author, post, clubVideos);
  } catch (err) {
    console.error("[content-hub] Gemini failed:", err);
    await markMessageProcessed({
      sourceChannelId: post.sourceChannelId,
      sourceMessageId: post.sourceMessageId,
      authorSlug: author.slug,
      status: "error",
      rejectReason: err instanceof Error ? err.message : "gemini_error",
    });
    return { ok: false, reason: "gemini_error" };
  }

  if (!gemini.approved) {
    console.info(formatRejectLog(author, post, gemini.reject_reason ?? "not approved"));
    await markMessageProcessed({
      sourceChannelId: post.sourceChannelId,
      sourceMessageId: post.sourceMessageId,
      authorSlug: author.slug,
      status: "rejected",
      rejectReason: gemini.reject_reason ?? undefined,
    });
    return { ok: true, skipped: true, reason: gemini.reject_reason ?? "rejected" };
  }

  for (const slug of gemini.video_author_slugs ?? []) {
    videoAuthorSlugs.add(slug);
  }

  let clubMessageId: number;
  try {
    clubMessageId = await publishToClubChannel({
      clubChannelId: getClubChannelId(),
      sourceChannelId: post.sourceChannelId,
      sourceMessageId: post.sourceMessageId,
      html: gemini.telegram_html,
      hasMedia: post.hasMedia,
    });
  } catch (err) {
    console.error("[content-hub] Telegram publish failed:", err);
    await markMessageProcessed({
      sourceChannelId: post.sourceChannelId,
      sourceMessageId: post.sourceMessageId,
      authorSlug: author.slug,
      status: "error",
      rejectReason: err instanceof Error ? err.message : "telegram_error",
    });
    return { ok: false, reason: "telegram_error" };
  }

  const blogPostId = await syncBlogPost({ authorSlug: author.slug, gemini });
  const videoIds = await syncClubVideos({
    clubVideos,
    authorSlugs: [...videoAuthorSlugs],
  });

  await markMessageProcessed({
    sourceChannelId: post.sourceChannelId,
    sourceMessageId: post.sourceMessageId,
    authorSlug: author.slug,
    status: "published",
    clubMessageId,
  });

  console.info(
    `[content-hub] Published ${author.slug} msg ${post.sourceMessageId} → club ${clubMessageId}`
  );

  return { ok: true, clubMessageId, blogPostId: blogPostId ?? undefined, videoIds };
}

export type { TelegramChannelPost };
