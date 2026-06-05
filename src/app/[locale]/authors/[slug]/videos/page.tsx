import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AuthorVideoCard } from "@/components/authors/author-video-card";
import { AuthorVideoCategoryTabs } from "@/components/authors/author-video-category-tabs";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import {
  authorYoutubeChannel,
  getPublishedAuthorPageBySlug,
  getVideoCategories,
  getVideos,
  pick,
  youtubeWatchUrl,
} from "@/lib/authors/db";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ category?: string }>;
};

export default async function AuthorVideosPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { category: categoryParam } = await searchParams;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) notFound();

  const t = await getTranslations("Author.videos");
  const [categories, videoRows] = await Promise.all([
    getVideoCategories(page.id),
    getVideos(page.id),
  ]);

  const validSlugs = new Set(categories.map((c) => c.slug));
  const active = categoryParam && validSlugs.has(categoryParam) ? categoryParam : "all";
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const channelUrl = authorYoutubeChannel(page.socials);

  const videos = videoRows
    .filter((v) => {
      if (active === "all") return true;
      const cat = v.category_id ? categoryById.get(v.category_id) : null;
      return cat?.slug === active;
    })
    .map((v) => ({
      id: v.id,
      title: pick(activeLocale, v.title_ru, v.title_uk, v.title_en),
      publishedAt: v.published_at,
      watchUrl: youtubeWatchUrl(v.youtube_id),
      categoryLabel: v.category_id
        ? pick(
            activeLocale,
            categoryById.get(v.category_id)?.name_ru ?? "",
            categoryById.get(v.category_id)?.name_uk ?? null,
            categoryById.get(v.category_id)?.name_en ?? null
          )
        : "",
    }));

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <AuthorVideoCategoryTabs
          slug={slug}
          active={active}
          categories={categories.map((c) => ({
            slug: c.slug,
            name: pick(activeLocale, c.name_ru, c.name_uk, c.name_en),
          }))}
        />
      </header>

      {channelUrl && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
          <p className="text-sm text-muted-foreground">{t("channelHint")}</p>
          <Button
            nativeButton={false}
            size="sm"
            variant="outline"
            className="border-primary/30"
            render={<a href={channelUrl} target="_blank" rel="noopener noreferrer" />}
          >
            {t("openChannel")}
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <AuthorVideoCard
            key={video.id}
            video={video}
            categoryLabel={video.categoryLabel}
            channelUrl={channelUrl}
            labels={{ watch: t("watch"), channel: t("openChannel") }}
          />
        ))}
      </div>
    </div>
  );
}
