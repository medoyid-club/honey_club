import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { enrollFree, createCheckoutSession } from "@/app/[locale]/courses/[slug]/actions";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/courses";
import { createClient } from "@/lib/supabase/server";

type Props = {
  courseId: string;
  stripePriceId: string | null;
  priceUsd: number;
  locale: string;
  slug: string;
  sessionId?: string;
};

export async function EnrollCard({
  courseId,
  stripePriceId,
  priceUsd,
  locale,
  slug,
  sessionId,
}: Props) {
  const t = await getTranslations("Course");

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  const isFree = priceUsd === 0;
  const displayPrice = isFree ? t("free") : formatPrice(priceUsd);

  let isEnrolled = false;
  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("payment_status")
      .eq("user_id", user.sub)
      .eq("course_id", courseId)
      .in("payment_status", ["free", "paid"])
      .maybeSingle();
    isEnrolled = !!data;
  }

  const justPaid = !!sessionId && !isEnrolled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{displayPrice}</CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {isEnrolled || justPaid ? t("accessNoteEnrolled") : t("accessNote")}
      </CardContent>

      <CardFooter>
        {isEnrolled || justPaid ? (
          <div className="flex w-full items-center justify-center rounded-md bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {t("alreadyEnrolled")}
          </div>
        ) : !user ? (
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href={`/login?redirect=/${locale}/courses/${slug}`} />}
          >
            {t("loginToEnroll")}
          </Button>
        ) : isFree ? (
          <form action={enrollFree} className="w-full">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" className="w-full">
              {t("enrollFree")}
            </Button>
          </form>
        ) : (
          <form action={createCheckoutSession} className="w-full">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="stripePriceId" value={stripePriceId!} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" className="w-full">
              {t("enroll")} — {displayPrice}
            </Button>
          </form>
        )}
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
