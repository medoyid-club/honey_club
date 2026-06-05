import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  createCategory,
  createVideo,
  deleteCategory,
  deleteVideo,
  updateCategory,
  updateVideo,
} from "@/app/[locale]/studio/videos/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VideoCategoryRow, VideoRow } from "@/lib/authors/db";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function StudioVideosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.videos");

  const supabase = await createClient();
  const [{ data: catData }, { data: vidData }] = await Promise.all([
    supabase
      .from("video_categories")
      .select("*")
      .eq("author_page_id", page.id)
      .order("position", { ascending: true }),
    supabase
      .from("videos")
      .select("*")
      .eq("author_page_id", page.id)
      .order("position", { ascending: true }),
  ]);

  const categories = (catData as VideoCategoryRow[] | null) ?? [];
  const videos = (vidData as VideoRow[] | null) ?? [];
  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name_ru ?? "—";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{t("categoriesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((c) => (
            <details key={c.id} className="rounded-md border border-foreground/10 p-3">
              <summary className="cursor-pointer text-sm">
                {c.position}. {c.name_ru}
              </summary>
              <form action={updateCategory} className="mt-3 space-y-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="categoryId" value={c.id} />
                <div className="grid gap-3 sm:grid-cols-5">
                  <Field name="position" label="#" value={String(c.position)} type="number" />
                  <Field name="name_ru" label="RU" value={c.name_ru} />
                  <Field name="name_uk" label="UK" value={c.name_uk} />
                  <Field name="name_en" label="EN" value={c.name_en} />
                  <Field name="slug" label="slug" value={c.slug} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="submit" variant="outline" size="sm">
                    {t("save")}
                  </Button>
                </div>
              </form>
              <form action={deleteCategory}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="categoryId" value={c.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                  {t("delete")}
                </Button>
              </form>
            </details>
          ))}

          <form action={createCategory} className="flex gap-2 pt-1">
            <input type="hidden" name="locale" value={locale} />
            <input name="name_ru" placeholder={t("newCategory")} className={inputClass} />
            <Button type="submit" variant="outline" size="sm">
              {t("addCategory")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Videos */}
      <Card>
        <CardHeader>
          <CardTitle>{t("videosTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {videos.map((v) => (
            <details key={v.id} className="rounded-md border border-foreground/10 p-3">
              <summary className="cursor-pointer text-sm">
                {v.position}. {v.title_ru}{" "}
                <span className="text-muted-foreground">
                  ({categoryName(v.category_id)})
                </span>
              </summary>
              <form action={updateVideo} className="mt-3 space-y-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="videoId" value={v.id} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field name="position" label="#" value={String(v.position)} type="number" />
                  <Field name="youtube_id" label={t("youtubeId")} value={v.youtube_id} />
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">{t("category")}</span>
                    <select name="category_id" defaultValue={v.category_id ?? ""} className={inputClass}>
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_ru}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field name="title_ru" label="RU" value={v.title_ru} />
                  <Field name="title_uk" label="UK" value={v.title_uk} />
                  <Field name="title_en" label="EN" value={v.title_en} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" size="sm">
                    {t("save")}
                  </Button>
                </div>
              </form>
              <form action={deleteVideo}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="videoId" value={v.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                  {t("delete")}
                </Button>
              </form>
            </details>
          ))}

          <form action={createVideo} className="space-y-3 border-t border-foreground/10 pt-3">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="title_ru" placeholder={t("newVideoTitle")} className={inputClass} />
              <input name="youtube_id" placeholder={t("youtubeId")} className={inputClass} />
              <select name="category_id" defaultValue="" className={inputClass}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ru}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" size="sm">
                {t("addVideo")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  type = "text",
}: {
  name: string;
  label: string;
  value: string | null;
  type?: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input name={name} type={type} defaultValue={value ?? ""} className={inputClass} />
    </label>
  );
}
