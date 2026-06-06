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

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function StudioPromoCodesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, created } = await searchParams;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.promoCodes");

  const supabase = await createClient();
  const { data } = await supabase
    .from("promo_codes")
    .select("id, code, discount_percent, redemption_count, max_redemptions, active, expires_at")
    .eq("author_page_id", page.id)
    .order("created_at", { ascending: false });

  const promos = (data as PromoRow[] | null) ?? [];

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
          <form action={createPromoCode} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="locale" value={locale} />
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">{t("codeLabel")}</span>
              <input
                name="code"
                placeholder="SUMMER20"
                className={inputClass}
                required
              />
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
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">{t("create")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {promos.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        {promos.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
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
                  <input type="hidden" name="active" value={promo.active ? "false" : "true"} />
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
