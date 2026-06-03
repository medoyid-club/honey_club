import { getTranslations, setRequestLocale } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { Link } from "@/i18n/navigation";
import { courses } from "@/lib/courses";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const featuredCourses = courses.slice(0, 3);

  const features = [
    { title: t("featureCoursesTitle"), description: t("featureCoursesDesc") },
    { title: t("featureProfileTitle"), description: t("featureProfileDesc") },
    { title: t("featureSocialTitle"), description: t("featureSocialDesc") },
  ];

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge variant="secondary">{t("badge")}</Badge>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/courses" />}>
              {t("ctaCourses")}
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/#about" />}>
              {t("ctaAbout")}
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-foreground/10 bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-2">
              <h2 className="font-heading text-xl font-medium">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {t("popularTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("popularSubtitle")}</p>
          </div>
          <Button variant="ghost" render={<Link href="/courses" />}>
            {t("allCourses")}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
