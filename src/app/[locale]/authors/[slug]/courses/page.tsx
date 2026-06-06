import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/course-card";
import type { Locale } from "@/i18n/routing";
import { getPublishedAuthorPageBySlug } from "@/lib/authors/db";
import { COURSE_WITH_AUTHOR_SELECT, mapCourse, type DbCourseRow } from "@/lib/courses";
import { createPublicClient } from "@/lib/supabase/public";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function AuthorCoursesPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) notFound();

  const t = await getTranslations("Author.courses");

  const supabase = createPublicClient();
  const { data: rows } = await supabase
    .from("courses")
    .select(COURSE_WITH_AUTHOR_SELECT)
    .eq("published", true)
    .eq("author_page_id", page.id)
    .order("created_at");

  const courses = ((rows as DbCourseRow[]) ?? []).map((c) =>
    mapCourse(c, locale as Locale)
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 px-6 py-12 text-center">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
