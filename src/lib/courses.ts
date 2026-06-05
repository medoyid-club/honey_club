import type { Locale } from "@/i18n/routing";

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseFormat = "course" | "lecture" | "seminar";
export type CourseStatus =
  | "draft"
  | "upcoming"
  | "live"
  | "completed"
  | "archived";
export type LessonType = "lecture" | "practice" | "seminar";
export type PricingMode = "online" | "offline";

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
  author_id: string | null;
  author_page_id: string | null;
  status: CourseStatus;
  cover_url: string | null;
  format: CourseFormat;
  level: CourseLevel;
  duration_hours: number;
  lessons: number;
  price_usd: number;
  price_online_usd: number;
  price_offline_usd: number;
  stripe_price_id: string | null;
  tags: string[];
  published: boolean;
  created_at: string;
};

export type DbModule = {
  id: string;
  course_id: string;
  position: number;
  title_ru: string;
  title_uk: string | null;
  title_en: string | null;
  summary_ru: string | null;
  summary_uk: string | null;
  summary_en: string | null;
  price_online_usd: number;
  price_offline_usd: number;
};

export type DbLesson = {
  id: string;
  module_id: string;
  position: number;
  type: LessonType;
  title_ru: string;
  title_uk: string | null;
  title_en: string | null;
  content_ru: string | null;
  content_uk: string | null;
  content_en: string | null;
  duration_minutes: number;
  video_url: string | null;
  resources: unknown;
};

/**
 * Active price by course status:
 *  - upcoming / live  → online price (the course is being delivered live)
 *  - completed / archived → offline price (self-paced recordings)
 *  - draft → not sellable
 */
export function activePricing(
  status: CourseStatus,
  onlineUsd: number,
  offlineUsd: number
): { mode: PricingMode; priceUsd: number } | null {
  if (status === "upcoming" || status === "live") {
    return { mode: "online", priceUsd: onlineUsd };
  }
  if (status === "completed" || status === "archived") {
    return { mode: "offline", priceUsd: offlineUsd };
  }
  return null;
}

export function isSellable(status: CourseStatus): boolean {
  return status !== "draft";
}

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  author: string;
  authorId: string | null;
  authorPageId: string | null;
  status: CourseStatus;
  coverUrl: string | null;
  format: CourseFormat;
  level: CourseLevel;
  durationHours: number;
  lessons: number;
  priceUsd: number;
  priceOnlineUsd: number;
  priceOfflineUsd: number;
  stripePriceId: string | null;
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
    authorId: course.author_id,
    authorPageId: course.author_page_id,
    status: course.status,
    coverUrl: course.cover_url,
    format: course.format,
    level: course.level,
    durationHours: course.duration_hours,
    lessons: course.lessons,
    priceUsd: course.price_usd,
    priceOnlineUsd: course.price_online_usd,
    priceOfflineUsd: course.price_offline_usd,
    stripePriceId: course.stripe_price_id,
    tags: course.tags,
  };
}

export function formatPrice(priceUsd: number): string {
  if (priceUsd === 0) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceUsd / 100);
}
