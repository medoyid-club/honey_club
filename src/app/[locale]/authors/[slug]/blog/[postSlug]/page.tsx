import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AuthorBlogPostCard } from "@/components/authors/author-blog-post-card";
import { Markdown } from "@/components/markdown";
import type { Locale } from "@/i18n/routing";
import {
  getPublishedAuthorPageBySlug,
  getPublishedBlogPost,
  pick,
} from "@/lib/authors/db";

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
  };
  const content = pick(activeLocale, raw.content_ru, raw.content_uk, raw.content_en);

  return (
    <article className="space-y-6">
      <AuthorBlogPostCard
        slug={slug}
        post={post}
        labels={{ read: t("read"), minutes: t("minutes") }}
      />
      <div className="rounded-xl border border-foreground/10 bg-card p-6">
        {content ? (
          <Markdown>{content}</Markdown>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("comingSoon")}
          </p>
        )}
      </div>
    </article>
  );
}
