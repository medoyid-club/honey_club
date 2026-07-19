import { reconcileBlogLocale } from "@/lib/content-hub/detect-locale";
import { generateGeminiJson } from "@/lib/gemini/generate-json";
import {
  authorWebUrl,
  buildAuthorFooterHtml,
  type AuthorHubConfig,
} from "@/lib/content-hub/authors";
import type { ClubYouTubeVideo, ContentLocale, GeminiHubResult, IncomingTelegramPost } from "@/lib/content-hub/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildPrompt(
  author: AuthorHubConfig,
  post: IncomingTelegramPost,
  clubVideos: ClubYouTubeVideo[]
): string {
  const footer = buildAuthorFooterHtml(author);
  const youtubeBlock =
    clubVideos.length > 0
      ? clubVideos
          .map(
            (v) =>
              `- ${v.videoId}: "${v.title}"\n  Канал: @${v.channelHandle}\n  Описание:\n${v.description.slice(0, 4000)}`
          )
          .join("\n\n")
      : "Нет ссылок на видео каналов Клуба (@honey_erbe, @medoyid-club).";

  return `Ты — редактор контент-хаба «Клуб медоедов». Обработай пост автора для публикации в Telegram-канале клуба и на сайте.

АВТОР ПОСТА:
- Имя: ${author.displayNameRu}
- Тег автора (обязательно включить один раз): ${author.hashtag}
- Slug на сайте: ${author.slug}
- Web: ${authorWebUrl(author)}

ИСХОДНЫЙ ПОСТ (сохрани смысл и формулировки автора, не переписывай радикально):
"""
${post.text || "(нет текста — только медиа)"}
"""

МЕДИА: ${post.hasMedia ? "есть (фото/видео/документ)" : "нет"}
URL в посте: ${post.rawUrls.length ? post.rawUrls.join(", ") : "нет"}

ДАННЫЕ YOUTUBE КЛУБА (если есть ссылки на @honey_erbe или @medoyid-club):
${youtubeBlock}

ПРАВИЛА ОТБОРА (approved=false если не проходит):
- Только картинка/мем без содержательного текста и без связи с тематикой клуба
- Одно короткое предложение без смысла для аудитории (< 40 символов полезного текста)
- Пустой пост без медиа и без текста
- Рекламный спам не связанный с автором/клубом

ЕСЛИ approved=true:
1. Определи blog_locale: "uk" | "ru" | "en" — язык ИСХОДНОГО поста автора (украинские буквы і/ї/є/ґ → uk).
2. blog_title, blog_excerpt, blog_content — ВСЕ на одном языке blog_locale. Заголовок и текст НЕ смешивать языки.
3. Сохрани оригинальный текст автора (можно слегка исправить опечатки и переносы).
4. Добавь 3–5 релевантных хештегов на языке поста (без символа # в массиве tags).
5. Обязательно включи тег автора ${author.hashtag} в telegram_html.
6. В конце telegram_html добавь блок подписки (HTML для Telegram):
${footer}
7. telegram_html — HTML для Telegram (parse_mode=HTML): разрешены <b>, <i>, <a href="...">, переносы строк. Не используй <br>.
8. content_type: "video" если главное — видео YouTube клуба без развёрнутого текста; "blog" если развёрнутый текст; "announcement" если короткий анонс; "mixed" если и текст и видео.
9. blog_title/blog_content — null только если нет текста для статьи (чистое видео без описания).
10. video_author_slugs — slug авторов для видеотеки (совместные эфиры → nata-ustimenko и tetiana-gukalo). Минимум: ["${author.slug}"]

Верни JSON:
{
  "approved": boolean,
  "reject_reason": string | null,
  "content_type": "blog" | "video" | "announcement" | "mixed",
  "telegram_html": string,
  "blog_locale": "ru" | "uk" | "en",
  "blog_title": string | null,
  "blog_excerpt": string | null,
  "blog_content": string | null,
  "tags": string[],
  "video_author_slugs": string[]
}`;
}

type LegacyGeminiHubResult = GeminiHubResult & {
  blog_title_ru?: string | null;
  blog_content_ru?: string | null;
};

function normalizeGeminiResult(raw: LegacyGeminiHubResult, sourceText: string): GeminiHubResult {
  const blog_locale = reconcileBlogLocale(raw.blog_locale, sourceText);

  let blog_title = raw.blog_title ?? raw.blog_title_ru ?? null;
  let blog_content = raw.blog_content ?? raw.blog_content_ru ?? null;
  let blog_excerpt = raw.blog_excerpt ?? null;

  if (!blog_excerpt && blog_content) {
    blog_excerpt = blog_content.slice(0, 280);
  }

  return {
    approved: raw.approved,
    reject_reason: raw.reject_reason,
    content_type: raw.content_type,
    telegram_html: raw.telegram_html,
    blog_locale,
    blog_title,
    blog_excerpt,
    blog_content,
    tags: raw.tags ?? [],
    video_author_slugs: raw.video_author_slugs ?? [],
  };
}

export async function processPostWithGemini(
  author: AuthorHubConfig,
  post: IncomingTelegramPost,
  clubVideos: ClubYouTubeVideo[]
): Promise<GeminiHubResult> {
  const prompt = buildPrompt(author, post, clubVideos);
  const raw = await generateGeminiJson<LegacyGeminiHubResult>(prompt);
  const result = normalizeGeminiResult(raw, post.text);

  if (!result.approved) {
    return result;
  }

  const tagsLine = [...new Set([author.hashtag, ...result.tags.map((t) => (t.startsWith("#") ? t : `#${t}`))])]
    .slice(0, 6)
    .join(" ");

  if (!result.telegram_html.includes(author.hashtag)) {
    result.telegram_html = `${result.telegram_html.trim()}\n\n${tagsLine}`;
  }

  if (!result.telegram_html.includes("Подписывайтесь")) {
    result.telegram_html = `${result.telegram_html.trim()}\n\n${buildAuthorFooterHtml(author)}`;
  }

  result.telegram_html = result.telegram_html.replace(/<br\s*\/?>/gi, "\n");

  if (!result.video_author_slugs?.length) {
    result.video_author_slugs = [author.slug];
  }

  return result;
}

export function formatRejectLog(author: AuthorHubConfig, post: IncomingTelegramPost, reason: string): string {
  return `[content-hub] Rejected (${author.slug}): ${reason}. Preview: ${escapeHtml(post.text.slice(0, 120))}`;
}

export type { ContentLocale };
