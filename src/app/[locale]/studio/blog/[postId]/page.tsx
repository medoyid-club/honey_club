import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  deleteBlogPost,
  updateBlogPost,
} from "@/app/[locale]/studio/blog/actions";
import { TranslateEmptyFieldsButton } from "@/components/studio/translate-empty-fields-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { BlogPostRow } from "@/lib/authors/db";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string; postId: string }>;
  searchParams: Promise<{ saved?: string }>;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function StudioBlogEditorPage({
  params,
  searchParams,
}: Props) {
  const { locale, postId } = await params;
  setRequestLocale(locale);
  const { saved } = await searchParams;

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.blog");

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", postId)
    .eq("author_page_id", page.id)
    .maybeSingle();

  if (!data) notFound();
  const post = data as BlogPostRow;

  return (
    <div className="space-y-6">
      <Link
        href="/studio/blog"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t("back")}
      </Link>

      {saved && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {t("saved")}
        </div>
      )}

      <form id="studio-blog-form" action={updateBlogPost} className="space-y-6" encType="multipart/form-data">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="postId" value={post.id} />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <CardTitle>{t("editorTitle")}</CardTitle>
            <TranslateEmptyFieldsButton
              formId="studio-blog-form"
              fieldBases={["title", "excerpt", "content"]}
              locale={locale}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("slug")}</span>
                <input name="slug" defaultValue={post.slug} className={inputClass} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("readingMinutes")}</span>
                <input
                  name="reading_minutes"
                  type="number"
                  defaultValue={post.reading_minutes}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="title_ru" label="RU" value={post.title_ru} />
              <Field name="title_uk" label="UK" value={post.title_uk} />
              <Field name="title_en" label="EN" value={post.title_en} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Area name="excerpt_ru" label={`${t("excerpt")} RU`} value={post.excerpt_ru} rows={3} />
              <Area name="excerpt_uk" label={`${t("excerpt")} UK`} value={post.excerpt_uk} rows={3} />
              <Area name="excerpt_en" label={`${t("excerpt")} EN`} value={post.excerpt_en} rows={3} />
            </div>

            <div className="grid gap-4">
              <Area name="content_ru" label={`${t("content")} RU`} value={post.content_ru} rows={10} />
              <Area name="content_uk" label={`${t("content")} UK`} value={post.content_uk} rows={10} />
              <Area name="content_en" label={`${t("content")} EN`} value={post.content_en} rows={10} />
            </div>
            <p className="text-xs text-muted-foreground">{t("markdownHint")}</p>

            <div className="space-y-2 rounded-lg border border-foreground/10 p-4">
              <p className="text-sm font-medium">{t("cover")}</p>
              {post.cover_url ? (
                <div className="overflow-hidden rounded-md border border-foreground/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.cover_url} alt="" className="max-h-48 w-full object-cover" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t("coverEmpty")}</p>
              )}
              <input type="hidden" name="cover_url_current" value={post.cover_url ?? ""} />
              <input
                type="file"
                name="cover"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={post.published}
                className="size-4"
              />
              <span>{t("publish")}</span>
            </label>

            <div className="flex justify-end">
              <Button type="submit">{t("save")}</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <form action={deleteBlogPost} className="border-t border-foreground/10 pt-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="postId" value={post.id} />
        <Button type="submit" variant="ghost" className="text-destructive">
          {t("delete")}
        </Button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: string | null;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input name={name} defaultValue={value ?? ""} className={inputClass} />
    </label>
  );
}

function Area({
  name,
  label,
  value,
  rows = 4,
}: {
  name: string;
  label: string;
  value: string | null;
  rows?: number;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <textarea
        name={name}
        defaultValue={value ?? ""}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
    </label>
  );
}
