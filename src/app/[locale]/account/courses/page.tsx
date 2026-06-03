import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen } from "lucide-react";

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
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/courses";
import { getUserEnrollments, requireUser } from "@/lib/account";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });
  return { title: t("coursesTitle") };
}

export default async function AccountCoursesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireUser(locale);
  if (!user) return null;

  const enrollments = await getUserEnrollments(user.id, locale as Locale);
  const t = await getTranslations("Account");
  const tCourse = await getTranslations("Course");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("coursesTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("coursesSubtitle")}</p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <BookOpen className="size-10 text-muted-foreground/50" />
            <div className="space-y-1">
              <p className="font-medium">{t("noCoursesTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("noCoursesDesc")}</p>
            </div>
            <Button nativeButton={false} render={<Link href="/courses" />}>
              {t("browseCourses")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((course) => {
            const price =
              course.priceUsd === 0 ? tCourse("free") : formatPrice(course.priceUsd);

            return (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      <Link href={`/courses/${course.slug}`} className="hover:underline">
                        {course.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary">{t("enrolled")}</Badge>
                  </div>
                  <CardDescription>{course.summary}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {tCourse("meta", {
                    lessons: course.lessons,
                    hours: course.durationHours,
                  })}
                </CardContent>
                <CardFooter className="mt-auto justify-between">
                  <span className="text-sm font-medium">{price}</span>
                  <Button
                    nativeButton={false}
                    size="sm"
                    render={<Link href={`/courses/${course.slug}`} />}
                  >
                    {tCourse("details")}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
