import { generateGeminiJson } from "@/lib/gemini/generate-json";
import {
  authorWebUrl,
  buildAuthorFooterHtml,
  type AuthorHubConfig,
} from "@/lib/content-hub/authors";
import type { ClubYouTubeVideo, GeminiHubResult, IncomingTelegramPost } from "@/lib/content-hub/types";

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
1. Сохрани оригинальный текст автора (можно слегка исправить опечатки и переносы)
2. Добавь 3–5 релевантных хештегов на русском или украинском (без символа # в массиве tags — только слова)
3. Обязательно включи тег автора ${author.hashtag} в telegram_html
4. В конце telegram_html добавь блок подписки (HTML для Telegram):
${footer}
5. telegram_html — HTML для Telegram (parse_mode=HTML): разрешены <b>, <i>, <a href="...">, переносы строк. Не используй <br>.
6. Если в посте есть сторонние ссылки (не YouTube клуба) — сохрани их как у автора
7. content_type: "video" если главное — видео YouTube клуба; "blog" если развёрнутый текст; "announcement" если короткий анонс; "mixed" если и текст и видео
8. blog_title_ru и blog_content_ru — для сайта (markdown), если есть полноценный текст; иначе null
9. video_author_slugs — массив slug авторов, кому добавить видео в видеотеку на сайте. Используй slug из описания YouTube (совместные эфиры → оба slug: nata-ustimenko и tetiana-gukalo). Минимум: ["${author.slug}"]

Верни JSON:
{
  "approved": boolean,
  "reject_reason": string | null,
  "content_type": "blog" | "video" | "announcement" | "mixed",
  "telegram_html": string,
  "blog_title_ru": string | null,
  "blog_content_ru": string | null,
  "tags": string[],
  "video_author_slugs": string[]
}`;
}

export async function processPostWithGemini(
  author: AuthorHubConfig,
  post: IncomingTelegramPost,
  clubVideos: ClubYouTubeVideo[]
): Promise<GeminiHubResult> {
  const prompt = buildPrompt(author, post, clubVideos);
  const result = await generateGeminiJson<GeminiHubResult>(prompt);

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

  // Safety: strip unsupported tags
  result.telegram_html = result.telegram_html.replace(/<br\s*\/?>/gi, "\n");

  if (!result.video_author_slugs?.length) {
    result.video_author_slugs = [author.slug];
  }

  return result;
}

export function formatRejectLog(author: AuthorHubConfig, post: IncomingTelegramPost, reason: string): string {
  return `[content-hub] Rejected (${author.slug}): ${reason}. Preview: ${escapeHtml(post.text.slice(0, 120))}`;
}
