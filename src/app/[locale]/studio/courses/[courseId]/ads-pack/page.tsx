import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { GoogleAdsPackPanel } from "@/components/studio/google-ads-pack-panel";
import { Link } from "@/i18n/navigation";
import { buildBaseGoogleAdsPack } from "@/lib/ads-pack/build-base-pack";
import type { AdsPackLocale } from "@/lib/ads-pack/types";
import type { DbCourse } from "@/lib/courses";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string; courseId: string }>;
};

export default async function StudioCourseAdsPackPage({ params }: Props) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.adsPack");

  const supabase = await createClient();
  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("author_page_id", page.id)
    .maybeSingle();

  if (!courseData) notFound();
  const course = courseData as DbCourse;

  const contentLocale = (["ru", "uk", "en"].includes(locale)
    ? locale
    : "ru") as AdsPackLocale;

  const initialPack = buildBaseGoogleAdsPack({
    course,
    authorName: page.display_name || course.author_name,
    authorSlug: page.slug,
    primaryLocale: contentLocale,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/studio/courses/${courseId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("back")}
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <GoogleAdsPackPanel
        locale={locale}
        courseId={courseId}
        courseTitle={course.title_ru}
        initialPack={initialPack}
      />
    </div>
  );
}
