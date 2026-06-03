import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { courses, formatPrice, getCourseBySlug } from "@/lib/courses";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return { title: "404" };
  }

  return {
    title: course.title,
    description: course.summary,
  };
}

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const course = getCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  const t = await getTranslations("Course");
  const activeLocale = await getLocale();

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
  const price =
    course.priceRub === 0 ? t("free") : formatPrice(course.priceRub, activeLocale);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Link
        href="/courses"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("back")}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{formatLabels[course.format]}</Badge>
            <Badge variant="outline">{levelLabels[course.level]}</Badge>
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

          <div className="prose prose-neutral max-w-none text-foreground">
            <p>{course.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-foreground/10 pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">{t("author")}</dt>
              <dd className="font-medium">{course.author}</dd>
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
          </dl>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">{price}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("accessNote")}
            </CardContent>
            <CardFooter>
              <Button className="w-full" render={<Link href="/login" />}>
                {t("enroll")}
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}
