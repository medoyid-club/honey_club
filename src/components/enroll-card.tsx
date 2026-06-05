import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  createCheckoutSession,
  enrollFree,
} from "@/app/[locale]/courses/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { activePricing, formatPrice, type CourseStatus } from "@/lib/courses";

export type PurchaseModule = {
  id: string;
  title: string;
  priceOnlineUsd: number;
  priceOfflineUsd: number;
};

type Props = {
  courseId: string;
  slug: string;
  locale: string;
  status: CourseStatus;
  priceOnlineUsd: number;
  priceOfflineUsd: number;
  modules: PurchaseModule[];
  isLoggedIn: boolean;
  fullCourseAccess: boolean;
  ownedModuleIds: string[];
  justPaid?: boolean;
};

export async function EnrollCard({
  courseId,
  slug,
  locale,
  status,
  priceOnlineUsd,
  priceOfflineUsd,
  modules,
  isLoggedIn,
  fullCourseAccess,
  ownedModuleIds,
  justPaid,
}: Props) {
  const t = await getTranslations("Course");

  const pricing = activePricing(status, priceOnlineUsd, priceOfflineUsd);
  const owned = new Set(ownedModuleIds);

  // Not sellable yet (draft).
  if (!pricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t("notSellable")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("notSellableHint")}
        </CardContent>
      </Card>
    );
  }

  if (fullCourseAccess || justPaid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t("alreadyEnrolled")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("accessNoteEnrolled")}
        </CardContent>
      </Card>
    );
  }

  const courseIsFree = pricing.priceUsd === 0;
  const coursePriceLabel = courseIsFree ? t("free") : formatPrice(pricing.priceUsd);
  const modePrice = (m: PurchaseModule) =>
    pricing.mode === "online" ? m.priceOnlineUsd : m.priceOfflineUsd;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{coursePriceLabel}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {pricing.mode === "online" ? t("priceOnlineLabel") : t("priceOfflineLabel")}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{t("accessNote")}</p>

        {!isLoggedIn ? (
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href={`/login?redirect=/${locale}/courses/${slug}`} />}
          >
            {t("loginToEnroll")}
          </Button>
        ) : courseIsFree ? (
          <form action={enrollFree}>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" className="w-full">
              {t("enrollFree")}
            </Button>
          </form>
        ) : (
          <form action={createCheckoutSession}>
            <input type="hidden" name="scope" value="course" />
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" className="w-full">
              {t("buyCourse")} — {coursePriceLabel}
            </Button>
          </form>
        )}

        {modules.length > 0 && !courseIsFree && (
          <div className="space-y-2 border-t border-foreground/10 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/70">
              {t("buyByModule")}
            </p>
            {modules.map((m) => {
              const isOwned = owned.has(m.id);
              const price = modePrice(m);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 truncate text-foreground/90">{m.title}</span>
                  {isOwned ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Check className="size-4" />
                      {t("owned")}
                    </span>
                  ) : isLoggedIn ? (
                    <form action={createCheckoutSession}>
                      <input type="hidden" name="scope" value="module" />
                      <input type="hidden" name="courseId" value={courseId} />
                      <input type="hidden" name="moduleId" value={m.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="slug" value={slug} />
                      <Button type="submit" variant="outline" size="sm">
                        {price === 0 ? t("free") : formatPrice(price)}
                      </Button>
                    </form>
                  ) : (
                    <span className="text-muted-foreground">
                      {price === 0 ? t("free") : formatPrice(price)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        {t("statusLabel")}: {t(`status.${status}` as never)}
      </CardFooter>
    </Card>
  );
}

export function EnrollCardFallback({ priceUsd }: { priceUsd: number }) {
  const displayPrice = priceUsd === 0 ? "Free" : formatPrice(priceUsd);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{displayPrice}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </CardContent>
      <CardFooter>
        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
      </CardFooter>
    </Card>
  );
}
