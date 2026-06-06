import type { Metadata } from "next";
import { Lock, PlayCircle } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CourseOverviewVideo } from "@/components/course-overview-video";
import { CourseCardAuthor } from "@/components/course-card-author";
import { CourseScheduleCalendar } from "@/components/course-schedule-calendar";
import { EnrollCard, type PurchaseModule } from "@/components/enroll-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCourseAccess } from "@/lib/access";
import { pick } from "@/lib/authors/db";
import {
  hasScheduledLessons,
  initialCalendarMonth,
  type ScheduleEvent,
} from "@/lib/course-schedule";
import { mapCourse, COURSE_WITH_AUTHOR_SELECT, type DbCourse, type DbCourseRow, type LessonType } from "@/lib/courses";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

type OutlineRow = {
  module_id: string;
  module_position: number;
  module_title_ru: string;
  module_title_uk: string | null;
  module_title_en: string | null;
  module_summary_ru: string | null;
  module_summary_uk: string | null;
  module_summary_en: string | null;
  module_price_online_usd: number;
  module_price_offline_usd: number;
  lesson_id: string | null;
  lesson_position: number | null;
  lesson_type: LessonType | null;
  lesson_title_ru: string | null;
  lesson_title_uk: string | null;
  lesson_title_en: string | null;
  lesson_duration_minutes: number | null;
  lesson_has_video: boolean | null;
  lesson_scheduled_at: string | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("courses")
    .select("title_ru, title_uk, title_en, summary_ru, summary_uk, summary_en")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "404" };
  const row = data as Pick<
    DbCourse,
    "title_ru" | "title_uk" | "title_en" | "summary_ru" | "summary_uk" | "summary_en"
  >;
  const title = pick(locale as Locale, row.title_ru, row.title_uk, row.title_en);
  const description = pick(
    locale as Locale,
    row.summary_ru,
    row.summary_uk,
    row.summary_en
  );
  return { title, description };
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { session_id } = await searchParams;
  setRequestLocale(locale);
  const activeLocale = (await getLocale()) as Locale;

  const publicClient = createPublicClient();
  const { data } = await publicClient
    .from("courses")
    .select(COURSE_WITH_AUTHOR_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) notFound();
  const dbCourse = data as DbCourseRow;
  const course = mapCourse(dbCourse, activeLocale);

  const t = await getTranslations("Course");

  // Outline (modules + lesson metadata, no content) via security-definer RPC.
  const { data: outlineData } = await publicClient.rpc("get_course_outline", {
    p_course_id: course.id,
  });
  const outline = (outlineData as OutlineRow[] | null) ?? [];

  type ModuleGroup = {
    id: string;
    position: number;
    title: string;
    summary: string;
    priceOnlineUsd: number;
    priceOfflineUsd: number;
    lessons: {
      id: string;
      position: number;
      type: LessonType;
      title: string;
      durationMinutes: number;
      hasVideo: boolean;
      scheduledAt: string | null;
    }[];
  };

  const moduleMap = new Map<string, ModuleGroup>();
  for (const r of outline) {
    let group = moduleMap.get(r.module_id);
    if (!group) {
      group = {
        id: r.module_id,
        position: r.module_position,
        title: pick(activeLocale, r.module_title_ru, r.module_title_uk, r.module_title_en),
        summary: pick(activeLocale, r.module_summary_ru, r.module_summary_uk, r.module_summary_en),
        priceOnlineUsd: r.module_price_online_usd,
        priceOfflineUsd: r.module_price_offline_usd,
        lessons: [],
      };
      moduleMap.set(r.module_id, group);
    }
    if (r.lesson_id) {
      group.lessons.push({
        id: r.lesson_id,
        position: r.lesson_position ?? 0,
        type: (r.lesson_type ?? "lecture") as LessonType,
        title: pick(activeLocale, r.lesson_title_ru, r.lesson_title_uk, r.lesson_title_en),
        durationMinutes: r.lesson_duration_minutes ?? 0,
        hasVideo: !!r.lesson_has_video,
        scheduledAt: r.lesson_scheduled_at,
      });
    }
  }
  const modules = Array.from(moduleMap.values()).sort(
    (a, b) => a.position - b.position
  );

  // Access
  const authed = await createClient();
  const { data: claimsData } = await authed.auth.getClaims();
  const user = claimsData?.claims ?? null;
  const access = await getCourseAccess(
    authed,
    user?.sub as string | undefined,
    course.id,
    (user?.email as string | undefined) ?? null
  );

  const formatLabels = {
    course: t("formatCourse"),
    lecture: t("formatLecture"),
    seminar: t("formatSeminar"),
  };
  const levelLabels = {
    beginner: t("levelBeginner"),
    intermediate: t("levelIntermediate"),
    advanced: t("levelAdvanced"),
  };
  const typeLabels: Record<LessonType, string> = {
    lecture: t("lessonTypes.lecture"),
    practice: t("lessonTypes.practice"),
    seminar: t("lessonTypes.seminar"),
  };

  const scheduleEvents: ScheduleEvent[] = modules.flatMap((m) =>
    m.lessons
      .filter((l) => l.scheduledAt)
      .map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        scheduledAt: l.scheduledAt!,
        durationMinutes: l.durationMinutes,
        weekPosition: m.position,
        dayPosition: l.position,
      }))
  );

  const showSchedule =
    (course.status === "upcoming" || course.status === "live") &&
    hasScheduledLessons(scheduleEvents);

  const scheduleTimezone =
    dbCourse.schedule_timezone || "Europe/Kyiv";
  const calendarMonth = initialCalendarMonth(
    scheduleEvents,
    dbCourse.cohort_starts_at
  );

  const purchaseModules: PurchaseModule[] = modules.map((m) => ({
    id: m.id,
    title: m.title,
    priceOnlineUsd: m.priceOnlineUsd,
    priceOfflineUsd: m.priceOfflineUsd,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Link
        href="/courses"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("back")}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{formatLabels[course.format]}</Badge>
              <Badge variant="outline">{levelLabels[course.level]}</Badge>
              <Badge variant={course.status === "draft" ? "outline" : "default"}>
                {t(`status.${course.status}` as never)}
              </Badge>
              {course.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground">{course.summary}</p>
            {course.description && <p className="text-foreground">{course.description}</p>}

            {course.overviewVideoUrl && (
              <CourseOverviewVideo
                src={course.overviewVideoUrl}
                poster={course.coverUrl}
                title={course.title}
              />
            )}

            <dl className="grid grid-cols-2 gap-4 border-t border-foreground/10 pt-6 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">{t("author")}</dt>
                <dd className="font-medium">
                  <CourseCardAuthor
                    name={course.author}
                    slug={course.authorSlug}
                    avatarUrl={course.authorAvatarUrl}
                    label=""
                  />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("lessons")}</dt>
                <dd className="font-medium">{course.lessons}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("duration")}</dt>
                <dd className="font-medium">
                  {course.durationHours} {t("hoursShort")}
                </dd>
              </div>
              {dbCourse.cohort_starts_at && (
                <div>
                  <dt className="text-muted-foreground">{t("schedule.starts")}</dt>
                  <dd className="font-medium" suppressHydrationWarning>
                    {new Intl.DateTimeFormat(activeLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: scheduleTimezone,
                    }).format(new Date(dbCourse.cohort_starts_at))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {showSchedule && (
            <CourseScheduleCalendar
              events={scheduleEvents}
              locale={activeLocale}
              timeZone={scheduleTimezone}
              initialYear={calendarMonth.year}
              initialMonth={calendarMonth.month}
            />
          )}

          {modules.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {t("curriculum")}
              </h2>
              {modules.map((m) => {
                const unlocked = access.fullCourse || access.moduleIds.has(m.id);
                return (
                  <Card key={m.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("week")} {m.position}: {m.title}
                      </CardTitle>
                      {m.summary && (
                        <p className="text-sm text-muted-foreground">{m.summary}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {m.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground">{t("noLessons")}</p>
                      )}
                      {m.lessons.map((l) => {
                        const inner = (
                          <div className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm">
                            <div className="flex min-w-0 items-center gap-2">
                              {unlocked ? (
                                <PlayCircle className="size-4 shrink-0 text-primary" />
                              ) : (
                                <Lock className="size-4 shrink-0 text-muted-foreground" />
                              )}
                              <span className="min-w-0 truncate">
                                {t("day")} {l.position}: {l.title}
                              </span>
                            </div>
                            <span
                              className="shrink-0 text-xs text-muted-foreground"
                              suppressHydrationWarning
                            >
                              {l.scheduledAt
                                ? new Intl.DateTimeFormat(activeLocale, {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: scheduleTimezone,
                                  }).format(new Date(l.scheduledAt))
                                : null}
                              {l.scheduledAt ? " · " : ""}
                              {typeLabels[l.type]} · {l.durationMinutes} {t("min")}
                            </span>
                          </div>
                        );
                        return unlocked ? (
                          <Link
                            key={l.id}
                            href={`/courses/${slug}/lessons/${l.id}`}
                            className="block transition-colors hover:bg-muted"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div key={l.id}>{inner}</div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <EnrollCard
            courseId={course.id}
            slug={slug}
            locale={activeLocale}
            status={course.status}
            priceOnlineUsd={course.priceOnlineUsd}
            priceOfflineUsd={course.priceOfflineUsd}
            modules={purchaseModules}
            isLoggedIn={!!user}
            fullCourseAccess={access.fullCourse}
            ownedModuleIds={Array.from(access.moduleIds)}
            justPaid={!!session_id && !access.fullCourse}
          />
        </aside>
      </div>
    </div>
  );
}
