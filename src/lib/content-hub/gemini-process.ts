import { reconcileBlogLocale } from "@/lib/content-hub/detect-locale";
import { generateGeminiJson } from "@/lib/gemini/generate-json";
import {
  authorWebUrl,
  buildAuthorFooterHtml,
  type AuthorHubConfig,
} from "@/lib/content-hub/authors";
import type {
  ClubYouTubeVideo,
  ContentLocale,
  GeminiHubResult,
  IncomingTelegramPost,
} from "@/lib/content-hub/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripTelegramMetadata(html: string): string {
  let text = html.trim();
  text = text.replace(/\n\n(?:#\w+\s*)+$/g, "");
  text = text.replace(/\n\n(Подписывайтесь|Підписуйтесь|Follow)[\s\S]*$/i, "");
  return text.trim();
}

function buildTagsLine(author: AuthorHubConfig, tags: string[]): string {
  const authorTag = author.hashtag.replace(/^#/, "").toLowerCase();
  const topical = tags
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter((tag) => tag && tag.toLowerCase() !== authorTag)
    .slice(0, 5);

  return [...new Set([author.hashtag, ...topical.map((tag) => `#${tag}`)])].slice(0, 6).join(" ");
}

function buildPrompt(
  author: AuthorHubConfig,
  post: IncomingTelegramPost,
  clubVideos: ClubYouTubeVideo[]
): string {
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
4. tags — массив из 3–5 тематических хештегов на языке поста (БЕЗ символа #). Тег ${author.hashtag} добавляется автоматически — не включай его в tags.
5. telegram_html — только текст поста и ссылки из оригинала. НЕ добавляй хештеги, блок подписки, футер со ссылками Web/Telegram/YouTube/Facebook — они добавятся программно.
6. telegram_html — HTML для Telegram (parse_mode=HTML): разрешены <b>, <i>, <a href="...">, переносы строк. Не используй <br>. Один язык — язык исходного поста.
7. content_type: "video" только если пост — чистая ссылка на видео без содержательного текста (< 100 символов смысла). Если есть развёрнутый текст — "blog" или "mixed", даже при наличии YouTube.
8. blog_title и blog_content — ОБЯЗАТЕЛЬНО заполни, если в посте есть содержательный текст (> 100 символов). null только для пустого поста без текста.
9. video_author_slugs — slug авторов для видеотеки (совместные эфиры → nata-ustimenko и tetiana-gukalo). Минимум: ["${author.slug}"]

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

  result.telegram_html = stripTelegramMetadata(result.telegram_html.replace(/<br\s*\/?>/gi, "\n"));
  const tagsLine = buildTagsLine(author, result.tags);
  const footer = buildAuthorFooterHtml(author, result.blog_locale);
  result.telegram_html = `${result.telegram_html}\n\n${tagsLine}\n\n${footer}`;

  if (!result.video_author_slugs?.length) {
    result.video_author_slugs = [author.slug];
  }

  return result;
}

export function formatRejectLog(author: AuthorHubConfig, post: IncomingTelegramPost, reason: string): string {
  return `[content-hub] Rejected (${author.slug}): ${reason}. Preview: ${escapeHtml(post.text.slice(0, 120))}`;
}

export type { ContentLocale };
