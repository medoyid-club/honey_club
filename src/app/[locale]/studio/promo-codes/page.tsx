import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  createPromoCode,
  deletePromoCode,
  togglePromoCode,
} from "@/app/[locale]/studio/promo-codes/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; created?: string }>;
};

type PromoRow = {
  id: string;
  code: string;
  discount_percent: number;
  redemption_count: number;
  max_redemptions: number | null;
  active: boolean;
  expires_at: string | null;
};

type CourseRow = {
  id: string;
  title_ru: string;
  course_modules: { id: string; title_ru: string; position: number }[];
};

type ScopeRow = {
  promo_code_id: string;
  course_id: string;
  module_id: string | null;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formatScopeLabel(
  scope: ScopeRow,
  courses: CourseRow[],
  t: (key: string) => string
): string {
  const course = courses.find((c) => c.id === scope.course_id);
  if (!course) return t("unknownScope");
  if (!scope.module_id) return course.title_ru;
  const mod = course.course_modules.find((m) => m.id === scope.module_id);
  return mod ? `${course.title_ru} — ${t("moduleShort")} ${mod.position}` : course.title_ru;
}

export default async function StudioPromoCodesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, created } = await searchParams;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.promoCodes");

  const supabase = await createClient();
  const [{ data: promosData }, { data: coursesData }] = await Promise.all([
    supabase
      .from("promo_codes")
      .select("id, code, discount_percent, redemption_count, max_redemptions, active, expires_at")
      .eq("author_page_id", page.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, title_ru, course_modules(id, title_ru, position)")
      .eq("author_page_id", page.id)
      .order("title_ru", { ascending: true }),
  ]);

  const promos = (promosData as PromoRow[] | null) ?? [];
  const courses = (coursesData as CourseRow[] | null) ?? [];
  const promoIds = promos.map((p) => p.id);

  const { data: scopeData } = promoIds.length
    ? await supabase
        .from("promo_code_items")
        .select("promo_code_id, course_id, module_id")
        .in("promo_code_id", promoIds)
    : { data: [] as ScopeRow[] };

  const scopesByPromo = new Map<string, ScopeRow[]>();
  for (const scope of (scopeData as ScopeRow[] | null) ?? []) {
    const list = scopesByPromo.get(scope.promo_code_id) ?? [];
    list.push(scope);
    scopesByPromo.set(scope.promo_code_id, list);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {created && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {t("created")}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t(`errors.${error}` as "errors.invalid")}
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form action={createPromoCode} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="text-muted-foreground">{t("codeLabel")}</span>
                <input name="code" placeholder="START" className={inputClass} required />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("discountLabel")}</span>
                <input
                  name="discount_percent"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={10}
                  className={inputClass}
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">{t("maxRedemptionsLabel")}</span>
                <input
                  name="max_redemptions"
                  type="number"
                  min={1}
                  placeholder={t("maxRedemptionsPlaceholder")}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">{t("scopeTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("scopeHint")}</p>
              </div>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noCourses")}</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="scope"
                          value={`course:${course.id}`}
                          className="mt-1 size-4"
                        />
                        <span>
                          <span className="font-medium">{course.title_ru}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t("wholeCourse")}
                          </span>
                        </span>
                      </label>
                      {course.course_modules
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((mod) => (
                          <label
                            key={mod.id}
                            className="ml-6 flex items-start gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              name="scope"
                              value={`module:${course.id}:${mod.id}`}
                              className="mt-1 size-4"
                            />
                            <span className="text-muted-foreground">
                              {t("moduleShort")} {mod.position}: {mod.title_ru}
                            </span>
                          </label>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit">{t("create")}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {promos.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        {promos.map((promo) => {
          const scopes = scopesByPromo.get(promo.id) ?? [];
          return (
            <Card key={promo.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono text-base font-semibold">{promo.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("stats", {
                        discount: promo.discount_percent,
                        used: promo.redemption_count,
                        max: promo.max_redemptions ?? t("unlimited"),
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={promo.active ? "default" : "outline"}>
                      {promo.active ? t("active") : t("inactive")}
                    </Badge>
                    <form action={togglePromoCode}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="promoId" value={promo.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={promo.active ? "false" : "true"}
                      />
                      <Button type="submit" variant="outline" size="sm">
                        {promo.active ? t("deactivate") : t("activate")}
                      </Button>
                    </form>
                    <form action={deletePromoCode}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="promoId" value={promo.id} />
                      <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                        {t("delete")}
                      </Button>
                    </form>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("appliesTo")}:{" "}
                  {scopes.length === 0
                    ? t("allCourses")
                    : scopes.map((scope) => formatScopeLabel(scope, courses, t)).join(", ")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
