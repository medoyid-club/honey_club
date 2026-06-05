import { getTranslations, setRequestLocale } from "next-intl/server";

import { createCourse } from "@/app/[locale]/studio/courses/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { CourseStatus } from "@/lib/courses";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

type CourseRow = {
  id: string;
  title_ru: string;
  slug: string;
  status: CourseStatus;
  published: boolean;
  lessons: number;
};

export default async function StudioCoursesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.courses");
  const tStatus = await getTranslations("Course.status");

  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title_ru, slug, status, published, lessons")
    .eq("author_page_id", page.id)
    .order("created_at", { ascending: false });

  const courses = (data as CourseRow[] | null) ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <form action={createCourse} className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="locale" value={locale} />
            <input
              name="title_ru"
              placeholder={t("newPlaceholder")}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit">{t("create")}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {courses.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        {courses.map((c) => (
          <Link key={c.id} href={`/studio/courses/${c.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title_ru}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{c.slug} · {c.lessons} {t("lessonsShort")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "draft" ? "outline" : "secondary"}>
                    {tStatus(c.status)}
                  </Badge>
                  {c.published && <Badge>{t("live")}</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
