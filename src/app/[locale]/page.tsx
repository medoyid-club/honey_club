import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import heroBanner from "../../../public/brand/banner.png";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { COURSE_WITH_AUTHOR_SELECT, mapCourse, type DbCourseRow } from "@/lib/courses";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const supabase = createPublicClient();
  const { data: rows } = await supabase
    .from("courses")
    .select(COURSE_WITH_AUTHOR_SELECT)
    .eq("published", true)
    .order("created_at")
    .limit(3);

  const featured = ((rows as DbCourseRow[]) ?? []).map((c) =>
    mapCourse(c, locale as Locale)
  );

  const features = [
    { title: t("featureCoursesTitle"), description: t("featureCoursesDesc") },
    { title: t("featureProfileTitle"), description: t("featureProfileDesc") },
    { title: t("featureSocialTitle"), description: t("featureSocialDesc") },
  ];

  return (
    <>
      <section className="honey-hero-bg w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-start gap-6 text-left lg:col-span-2">
              <Badge className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/15">
                {t("badge")}
              </Badge>
              <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {t("title")}
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="honey-glow" nativeButton={false} render={<Link href="/courses" />}>
                  {t("ctaCourses")}
                </Button>
                <Button size="lg" variant="outline" className="border-primary/25 hover:bg-primary/5 hover:text-primary" nativeButton={false} render={<Link href="/#about" />}>
                  {t("ctaAbout")}
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-1 lg:justify-end">
              <Image
                src={heroBanner}
                alt={t("heroBannerAlt")}
                priority
                sizes="(max-width: 1024px) 60vw, 33vw"
                className="h-auto w-full max-w-xs sm:max-w-sm lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-foreground/10 bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="space-y-2">
              <h2 className="font-heading text-xl font-medium">{f.title}</h2>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {t("popularTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("popularSubtitle")}</p>
            </div>
            <Button variant="ghost" nativeButton={false} render={<Link href="/courses" />}>
              {t("allCourses")}
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
