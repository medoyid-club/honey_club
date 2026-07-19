import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AuthorBlogPostCard } from "@/components/authors/author-blog-post-card";
import { BlogWatchVideoButton } from "@/components/authors/blog-watch-video-button";
import { Markdown } from "@/components/markdown";
import type { Locale } from "@/i18n/routing";
import {
  getPublishedAuthorPageBySlug,
  getPublishedBlogPost,
  pick,
} from "@/lib/authors/db";
import { extractYoutubeIdsFromText } from "@/lib/youtube-id";

type Props = {
  params: Promise<{ locale: string; slug: string; postSlug: string }>;
};

export default async function AuthorBlogPostPage({ params }: Props) {
  const { locale, slug, postSlug } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) notFound();

  const raw = await getPublishedBlogPost(page.id, postSlug);
  if (!raw) notFound();

  const t = await getTranslations("Author.blog");
  const post = {
    slug: raw.slug,
    title: pick(activeLocale, raw.title_ru, raw.title_uk, raw.title_en),
    excerpt: pick(activeLocale, raw.excerpt_ru, raw.excerpt_uk, raw.excerpt_en),
    publishedAt: raw.published_at ?? new Date().toISOString(),
    readingMinutes: raw.reading_minutes,
    coverUrl: raw.cover_url,
  };
  const content = pick(activeLocale, raw.content_ru, raw.content_uk, raw.content_en);
  const videoIds = extractYoutubeIdsFromText(
    raw.content_ru,
    raw.content_uk,
    raw.content_en,
    raw.excerpt_ru,
    raw.excerpt_uk,
    raw.excerpt_en
  );
  const primaryVideoId = videoIds[0] ?? null;

  return (
    <article className="space-y-6">
      <AuthorBlogPostCard
        slug={slug}
        post={post}
        labels={{ read: t("read"), minutes: t("minutes") }}
        linkTitle={false}
      />
      <div className="rounded-xl border border-foreground/10 bg-card p-6 space-y-4">
        {content ? (
          <Markdown>{content}</Markdown>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("comingSoon")}
          </p>
        )}
        {primaryVideoId ? (
          <BlogWatchVideoButton videoId={primaryVideoId} label={t("watchVideo")} />
        ) : null}
      </div>
    </article>
  );
}
