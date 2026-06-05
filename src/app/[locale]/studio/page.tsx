import { BookOpen, Newspaper, Video } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

export default async function StudioOverviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio");

  const supabase = await createClient();
  const [courses, posts, videos] = await Promise.all([
    supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("author_page_id", page.id),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("author_page_id", page.id),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("author_page_id", page.id),
  ]);

  const stats = [
    {
      label: t("nav.courses"),
      value: courses.count ?? 0,
      href: "/studio/courses",
      icon: BookOpen,
    },
    {
      label: t("nav.blog"),
      value: posts.count ?? 0,
      href: "/studio/blog",
      icon: Newspaper,
    },
    {
      label: t("nav.videos"),
      value: videos.count ?? 0,
      href: "/studio/videos",
      icon: Video,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("overviewTitle")}
          </h1>
          <p className="text-muted-foreground">{t("overviewSubtitle")}</p>
        </div>
        <Badge variant={page.published ? "default" : "outline"}>
          {page.published ? t("statusPublished") : t("statusDraft")}
        </Badge>
      </header>

      {!page.published && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-muted-foreground">{t("publishHint")}</p>
            <Button nativeButton={false} render={<Link href="/studio/profile" />}>
              {t("goToProfile")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="font-heading text-3xl font-semibold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
