import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CourseCard } from "@/components/course-card";
import type { Locale } from "@/i18n/routing";
import { localizedCourse, type DbCourse } from "@/lib/courses";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Courses" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Courses");

  const supabase = createPublicClient();
  const { data: rows } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at");

  const courses = (rows as DbCourse[] ?? []).map((c) =>
    localizedCourse(c, locale as Locale)
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <header className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </div>
  );
}
