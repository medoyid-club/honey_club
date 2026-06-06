"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { CourseCardAuthor } from "@/components/course-card-author";
import { CoursePrice } from "@/components/course-price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { type Course } from "@/lib/courses";
import { courseDisplayPrice } from "@/lib/pricing";

type Props = {
  course: Course;
  variant?: "featured" | "compact";
};

export function CourseCard({ course, variant = "featured" }: Props) {
  const t = useTranslations("Course");
  const pricing = courseDisplayPrice({
    status: course.status,
    priceOnlineUsd: course.priceOnlineUsd,
    priceOfflineUsd: course.priceOfflineUsd,
    saleDiscountPercent: course.saleDiscountPercent,
  });

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

  const coverBadgeClass =
    "border-border bg-card text-card-foreground shadow-md";
  const badges = (
    <>
      <Badge variant="secondary">{formatLabels[course.format]}</Badge>
      <Badge variant="outline">{levelLabels[course.level]}</Badge>
    </>
  );
  const coverBadges = (
    <>
      <Badge variant="secondary" className={coverBadgeClass}>
        {formatLabels[course.format]}
      </Badge>
      <Badge variant="outline" className={coverBadgeClass}>
        {levelLabels[course.level]}
      </Badge>
      {pricing?.discountPercent ? (
        <Badge className={`${coverBadgeClass} bg-destructive/10 text-destructive`}>
          −{pricing.discountPercent}%
        </Badge>
      ) : null}
    </>
  );

  if (variant === "compact") {
    return (
      <Card className="flex h-full flex-col transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">{badges}</div>
          <CardTitle className="text-base leading-snug">
            <Link href={`/courses/${course.slug}`} className="hover:underline">
              {course.title}
            </Link>
          </CardTitle>
          <CardDescription>{course.summary}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <CourseCardAuthor
            name={course.author}
            slug={course.authorSlug}
            avatarUrl={course.authorAvatarUrl}
            label={t("author")}
          />
          <p>{t("meta", { lessons: course.lessons, hours: course.durationHours })}</p>
        </CardContent>

        <CardFooter className="mt-auto justify-between gap-3">
          <CoursePrice pricing={pricing} size="sm" />
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/courses/${course.slug}`} />}
          >
            {t("details")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="relative aspect-video w-full bg-primary/5">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">{coverBadges}</div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <Link href={`/courses/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription>{course.summary}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <CourseCardAuthor
          name={course.author}
          slug={course.authorSlug}
          avatarUrl={course.authorAvatarUrl}
          label={t("author")}
        />
        <p>{t("meta", { lessons: course.lessons, hours: course.durationHours })}</p>
      </CardContent>

      <CardFooter className="mt-auto justify-between gap-3 pb-6">
        <CoursePrice pricing={pricing} />
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/courses/${course.slug}`} />}
        >
          {t("details")}
        </Button>
      </CardFooter>
    </Card>
  );
}
