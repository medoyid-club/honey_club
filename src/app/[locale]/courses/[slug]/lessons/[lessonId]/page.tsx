import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/authors/db";
import type { DbLesson, LessonType } from "@/lib/courses";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string; slug: string; lessonId: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { locale, slug, lessonId } = await params;
  setRequestLocale(locale);
  const activeLocale = (await getLocale()) as Locale;
  const t = await getTranslations("Course");

  // RLS only returns this row if the user has access (enrollment) or owns it.
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">{t("lockedTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{t("lockedText")}</p>
            <Button nativeButton={false} render={<Link href={`/courses/${slug}`} />}>
              {t("back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lesson = data as DbLesson;
  const title = pick(activeLocale, lesson.title_ru, lesson.title_uk, lesson.title_en);
  const content = pick(
    activeLocale,
    lesson.content_ru,
    lesson.content_uk,
    lesson.content_en
  );
  const typeLabels: Record<LessonType, string> = {
    lecture: t("lessonTypes.lecture"),
    practice: t("lessonTypes.practice"),
    seminar: t("lessonTypes.seminar"),
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link
        href={`/courses/${slug}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("back")}
      </Link>

      <div className="mt-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{typeLabels[lesson.type]}</Badge>
          <Badge variant="outline">
            {lesson.duration_minutes} {t("min")}
          </Badge>
        </div>

        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>

        {lesson.video_url && (
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {t("watchVideo")}
          </a>
        )}

        {content ? (
          <Markdown>{content}</Markdown>
        ) : (
          <p className="text-muted-foreground">{t("noContent")}</p>
        )}
      </div>
    </div>
  );
}
