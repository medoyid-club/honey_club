import { useLocale, useTranslations } from "next-intl";

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
import { formatPrice, type Course } from "@/lib/courses";

export function CourseCard({ course }: { course: Course }) {
  const t = useTranslations("Course");
  const locale = useLocale();

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
    course.priceRub === 0 ? t("free") : formatPrice(course.priceRub, locale);

  return (
    <Card className="h-full transition-shadow hover:ring-foreground/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{formatLabels[course.format]}</Badge>
          <Badge variant="outline">{levelLabels[course.level]}</Badge>
        </div>
        <CardTitle className="text-lg">
          <Link href={`/courses/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription>{course.summary}</CardDescription>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        <p>
          {t("author")}: {course.author}
        </p>
        <p>{t("meta", { lessons: course.lessons, hours: course.durationHours })}</p>
      </CardContent>

      <CardFooter className="justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          {price}
        </span>
        <Button size="sm" nativeButton={false} render={<Link href={`/courses/${course.slug}`} />}>
          {t("details")}
        </Button>
      </CardFooter>
    </Card>
  );
}
