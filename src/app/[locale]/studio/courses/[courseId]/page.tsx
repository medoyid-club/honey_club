import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import {
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  updateCourse,
  updateLesson,
  updateModule,
} from "@/app/[locale]/studio/courses/actions";
import { TranslateEmptyFieldsButton } from "@/components/studio/translate-empty-fields-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { DbCourse, DbLesson, DbModule } from "@/lib/courses";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string; courseId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function StudioCourseEditorPage({
  params,
  searchParams,
}: Props) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);
  const { saved, error: errorParam } = await searchParams;

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.courseEditor");
  const tStatus = await getTranslations("Course.status");
  const tType = await getTranslations("Course.lessonTypes");
  const tCourse = await getTranslations("Course");

  const supabase = await createClient();
  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("author_page_id", page.id)
    .maybeSingle();

  if (!courseData) notFound();
  const course = courseData as DbCourse;

  const { data: modulesData } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  const modules = (modulesData as DbModule[] | null) ?? [];

  const moduleIds = modules.map((m) => m.id);
  const { data: lessonsData } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("position", { ascending: true })
    : { data: [] as DbLesson[] };
  const lessons = (lessonsData as DbLesson[] | null) ?? [];
  const lessonsByModule = new Map<string, DbLesson[]>();
  for (const l of lessons) {
    const arr = lessonsByModule.get(l.module_id) ?? [];
    arr.push(l);
    lessonsByModule.set(l.module_id, arr);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/studio/courses"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("back")}
        </Link>
        {course.published && (
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm text-primary hover:underline"
          >
            {t("viewPublic")}
          </Link>
        )}
      </div>

      {saved && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {t("saved")}
        </div>
      )}

      {errorParam === "media_required" && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t("mediaRequired")}
        </div>
      )}

      {/* Course meta + media */}
      <form
        id="studio-course-form"
        action={updateCourse}
        encType="multipart/form-data"
        className="space-y-6"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="courseId" value={course.id} />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <CardTitle>{t("metaTitle")}</CardTitle>
            <TranslateEmptyFieldsButton
              formId="studio-course-form"
              fieldBases={["title", "summary", "description"]}
              locale={locale}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="title_ru" label={`${t("name")} RU`} value={course.title_ru} />
              <Field name="title_uk" label={`${t("name")} UK`} value={course.title_uk} />
              <Field name="title_en" label={`${t("name")} EN`} value={course.title_en} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Area name="summary_ru" label={`${t("summary")} RU`} value={course.summary_ru} />
              <Area name="summary_uk" label={`${t("summary")} UK`} value={course.summary_uk} />
              <Area name="summary_en" label={`${t("summary")} EN`} value={course.summary_en} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Area name="description_ru" label={`${t("description")} RU`} value={course.description_ru} />
              <Area name="description_uk" label={`${t("description")} UK`} value={course.description_uk} />
              <Area name="description_en" label={`${t("description")} EN`} value={course.description_en} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("status")}</span>
                <select name="status" defaultValue={course.status} className={inputClass}>
                  {(["draft", "upcoming", "live", "completed", "archived"] as const).map((s) => (
                    <option key={s} value={s}>
                      {tStatus(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("format")}</span>
                <select name="format" defaultValue={course.format} className={inputClass}>
                  <option value="course">{tCourse("formatCourse")}</option>
                  <option value="lecture">{tCourse("formatLecture")}</option>
                  <option value="seminar">{tCourse("formatSeminar")}</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("level")}</span>
                <select name="level" defaultValue={course.level} className={inputClass}>
                  <option value="beginner">{tCourse("levelBeginner")}</option>
                  <option value="intermediate">{tCourse("levelIntermediate")}</option>
                  <option value="advanced">{tCourse("levelAdvanced")}</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                name="price_online_usd"
                label={t("priceOnline")}
                value={String(course.price_online_usd)}
                type="number"
              />
              <Field
                name="price_offline_usd"
                label={t("priceOffline")}
                value={String(course.price_offline_usd)}
                type="number"
              />
              <Field
                name="sale_discount_percent"
                label={t("saleDiscount")}
                value={course.sale_discount_percent != null ? String(course.sale_discount_percent) : ""}
                type="number"
                placeholder={t("saleDiscountPlaceholder")}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="tags" label={t("tags")} value={course.tags.join(", ")} />
            </div>
            <p className="text-xs text-muted-foreground">{t("priceHint")}</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={course.published}
                className="size-4"
              />
              <span>{t("published")}</span>
            </label>
            <div className="flex justify-end">
              <Button type="submit">{t("saveCourse")}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("mediaTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("mediaHint")}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              <MediaField
                name="cover"
                label={t("cover")}
                accept="image/jpeg,image/png,image/webp"
                currentUrl={course.cover_url}
                currentLabel={t("currentCover")}
              />
              <MediaField
                name="overview_video"
                label={t("overviewVideo")}
                accept="video/mp4,video/webm"
                currentUrl={course.overview_video_url}
                currentLabel={t("currentOverviewVideo")}
                isVideo
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">{t("saveCourse")}</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Modules */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">{t("modulesTitle")}</h2>
        </div>

        {modules.map((m) => {
          const moduleLessons = lessonsByModule.get(m.id) ?? [];
          return (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("week")} {m.position}: {m.title_ru}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <details>
                  <summary className="cursor-pointer text-sm text-primary">
                    {t("editModule")}
                  </summary>
                  <form
                    id={`studio-module-${m.id}`}
                    action={updateModule}
                    className="mt-3 space-y-3"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={m.id} />
                    <div className="flex justify-end">
                      <TranslateEmptyFieldsButton
                        formId={`studio-module-${m.id}`}
                        fieldBases={["title", "summary"]}
                        locale={locale}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <Field name="position" label={t("position")} value={String(m.position)} type="number" />
                      <Field name="title_ru" label="RU" value={m.title_ru} />
                      <Field name="title_uk" label="UK" value={m.title_uk} />
                      <Field name="title_en" label="EN" value={m.title_en} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Area name="summary_ru" label={`${t("summary")} RU`} value={m.summary_ru} />
                      <Area name="summary_uk" label={`${t("summary")} UK`} value={m.summary_uk} />
                      <Area name="summary_en" label={`${t("summary")} EN`} value={m.summary_en} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field name="price_online_usd" label={t("priceOnline")} value={String(m.price_online_usd)} type="number" />
                      <Field name="price_offline_usd" label={t("priceOffline")} value={String(m.price_offline_usd)} type="number" />
                      <Field
                        name="sale_discount_percent"
                        label={t("saleDiscount")}
                        value={m.sale_discount_percent != null ? String(m.sale_discount_percent) : ""}
                        type="number"
                        placeholder={t("saleDiscountPlaceholder")}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="outline" size="sm">
                        {t("saveModule")}
                      </Button>
                    </div>
                  </form>
                  <form action={deleteModule} className="mt-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={m.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      {t("deleteModule")}
                    </Button>
                  </form>
                </details>

                {/* Lessons */}
                <div className="space-y-2 border-l border-foreground/10 pl-4">
                  {moduleLessons.map((l) => (
                    <details key={l.id} className="rounded-md border border-foreground/10 p-3">
                      <summary className="cursor-pointer text-sm">
                        {t("day")} {l.position}: {l.title_ru}{" "}
                        <span className="text-muted-foreground">
                          ({tType(l.type)}, {l.duration_minutes} {t("min")})
                        </span>
                      </summary>
                      <form
                        id={`studio-lesson-${l.id}`}
                        action={updateLesson}
                        className="mt-3 space-y-3"
                      >
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="lessonId" value={l.id} />
                        <div className="flex justify-end">
                          <TranslateEmptyFieldsButton
                            formId={`studio-lesson-${l.id}`}
                            fieldBases={["title", "content"]}
                            locale={locale}
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-4">
                          <Field name="position" label={t("position")} value={String(l.position)} type="number" />
                          <label className="space-y-1 text-sm">
                            <span className="text-muted-foreground">{t("type")}</span>
                            <select name="type" defaultValue={l.type} className={inputClass}>
                              {(["lecture", "practice", "seminar"] as const).map((ty) => (
                                <option key={ty} value={ty}>
                                  {tType(ty)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <Field name="duration_minutes" label={t("durationMin")} value={String(l.duration_minutes)} type="number" />
                          <Field name="video_url" label={t("videoUrl")} value={l.video_url} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field name="title_ru" label="RU" value={l.title_ru} />
                          <Field name="title_uk" label="UK" value={l.title_uk} />
                          <Field name="title_en" label="EN" value={l.title_en} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Area name="content_ru" label={`${t("content")} RU`} value={l.content_ru} rows={6} />
                          <Area name="content_uk" label={`${t("content")} UK`} value={l.content_uk} rows={6} />
                          <Area name="content_en" label={`${t("content")} EN`} value={l.content_en} rows={6} />
                        </div>
                        <p className="text-xs text-muted-foreground">{t("markdownHint")}</p>
                        <div className="flex justify-end">
                          <Button type="submit" variant="outline" size="sm">
                            {t("saveLesson")}
                          </Button>
                        </div>
                      </form>
                      <form action={deleteLesson} className="mt-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="lessonId" value={l.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          {t("deleteLesson")}
                        </Button>
                      </form>
                    </details>
                  ))}

                  <form action={createLesson} className="flex gap-2 pt-1">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={m.id} />
                    <input
                      name="title_ru"
                      placeholder={t("newLesson")}
                      className={inputClass}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {t("addLesson")}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardContent className="pt-6">
            <form action={createModule} className="flex gap-2">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="courseId" value={course.id} />
              <input
                name="title_ru"
                placeholder={t("newModule")}
                className={inputClass}
              />
              <Button type="submit">{t("addModule")}</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Danger zone */}
      <form action={deleteCourse} className="border-t border-foreground/10 pt-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="courseId" value={course.id} />
        <Button type="submit" variant="ghost" className="text-destructive">
          {t("deleteCourse")}
        </Button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  value: string | null;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

function Area({
  name,
  label,
  value,
  rows = 3,
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

function MediaField({
  name,
  label,
  accept,
  currentUrl,
  currentLabel,
  isVideo = false,
}: {
  name: string;
  label: string;
  accept: string;
  currentUrl: string | null;
  currentLabel: string;
  isVideo?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {currentUrl && (
        <div className="overflow-hidden rounded-md border border-border">
          {isVideo ? (
            <video
              src={currentUrl}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="" className="aspect-video w-full object-cover" />
          )}
          <p className="border-t border-border px-2 py-1 text-xs text-muted-foreground">
            {currentLabel}
          </p>
        </div>
      )}
      <input
        type="file"
        name={name}
        accept={accept}
        className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
      />
    </label>
  );
}
