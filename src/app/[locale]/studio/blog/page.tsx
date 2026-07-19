import { getTranslations, setRequestLocale } from "next-intl/server";

import { createBlogPost } from "@/app/[locale]/studio/blog/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/authors/db";
import type { Locale } from "@/i18n/routing";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

type PostRow = {
  id: string;
  title_ru: string;
  title_uk: string | null;
  title_en: string | null;
  slug: string;
  published: boolean;
  reading_minutes: number;
};

export default async function StudioBlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.blog");

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title_ru, title_uk, title_en, slug, published, reading_minutes")
    .eq("author_page_id", page.id)
    .order("created_at", { ascending: false });

  const posts = (data as PostRow[] | null) ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
        <p className="text-sm text-muted-foreground">{t("draftHint")}</p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <form action={createBlogPost} className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="locale" value={locale} />
            <input
              name="title_ru"
              placeholder={t("newPlaceholder")}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit">{t("create")}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        {posts.map((p) => (
          <Link key={p.id} href={`/studio/blog/${p.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {pick(activeLocale, p.title_ru, p.title_uk, p.title_en) || p.title_ru}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                </div>
                <Badge variant={p.published ? "default" : "outline"}>
                  {p.published ? t("published") : t("draft")}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
