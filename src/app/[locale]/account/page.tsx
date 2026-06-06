import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen } from "lucide-react";

import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  displayName,
  getUserEnrollments,
  getUserProfile,
  requireUser,
} from "@/lib/account";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });
  return { title: t("overviewTitle") };
}

export default async function AccountOverviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireUser(locale);
  if (!user) return null;

  const profile = await getUserProfile(user.id, user.email);
  const enrollments = await getUserEnrollments(user.id, locale as Locale, user.email);
  const t = await getTranslations("Account");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("overviewTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("overviewSubtitle", { name: displayName(profile) })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("statsCourses")}</CardDescription>
            <CardTitle className="font-heading text-3xl text-primary">{enrollments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("statsProfile")}</CardDescription>
            <CardTitle className="font-heading text-base font-medium">
              {profile.fullName ?? profile.email}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <UserAvatar profile={profile} size="sm" />
              <p className="text-sm text-muted-foreground">{t("statsProfileHint")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-medium">{t("recentCourses")}</h2>
          {enrollments.length > 0 && (
            <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/account/courses" />}>
              {t("viewAll")}
            </Button>
          )}
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
          <div className="grid gap-3">
            {enrollments.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-card px-4 py-3 transition-colors hover:border-primary/25 hover:bg-primary/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{course.summary}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t("enrolled")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
