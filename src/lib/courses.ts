import type { Locale } from "@/i18n/routing";

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseFormat = "course" | "lecture" | "seminar";

export type DbCourse = {
  id: string;
  slug: string;
  title_ru: string;
  title_uk: string | null;
  title_en: string | null;
  summary_ru: string;
  summary_uk: string | null;
  summary_en: string | null;
  description_ru: string | null;
  description_uk: string | null;
  description_en: string | null;
  author_name: string;
  format: CourseFormat;
  level: CourseLevel;
  duration_hours: number;
  lessons: number;
  price_rub: number;
  tags: string[];
  published: boolean;
  created_at: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  author: string;
  format: CourseFormat;
  level: CourseLevel;
  durationHours: number;
  lessons: number;
  priceRub: number;
  tags: string[];
};

export function localizedCourse(course: DbCourse, locale: Locale): Course {
  return {
    id: course.id,
    slug: course.slug,
    title:
      (locale === "uk" ? course.title_uk : locale === "en" ? course.title_en : null) ??
      course.title_ru,
    summary:
      (locale === "uk"
        ? course.summary_uk
        : locale === "en"
          ? course.summary_en
          : null) ?? course.summary_ru,
    description:
      (locale === "uk"
        ? course.description_uk
        : locale === "en"
          ? course.description_en
          : null) ?? course.description_ru,
    author: course.author_name,
    format: course.format,
    level: course.level,
    durationHours: course.duration_hours,
    lessons: course.lessons,
    priceRub: course.price_rub,
    tags: course.tags,
  };
}

export function formatPrice(priceRub: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(priceRub);
}
