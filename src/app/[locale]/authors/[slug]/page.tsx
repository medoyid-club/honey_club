import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AuthorBlogPostCard } from "@/components/authors/author-blog-post-card";
import type { Locale } from "@/i18n/routing";
import {
  getPublishedAuthorPageBySlug,
  getPublishedBlogPosts,
  pick,
} from "@/lib/authors/db";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function AuthorBlogPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) notFound();

  const t = await getTranslations("Author.blog");
  const rows = await getPublishedBlogPosts(page.id);
  const posts = rows.map((p) => ({
    slug: p.slug,
    title: pick(activeLocale, p.title_ru, p.title_uk, p.title_en),
    excerpt: pick(activeLocale, p.excerpt_ru, p.excerpt_uk, p.excerpt_en),
    publishedAt: p.published_at ?? new Date().toISOString(),
    readingMinutes: p.reading_minutes,
    coverUrl: p.cover_url,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <AuthorBlogPostCard
              key={post.slug}
              slug={slug}
              post={post}
              labels={{ read: t("read"), minutes: t("minutes") }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
