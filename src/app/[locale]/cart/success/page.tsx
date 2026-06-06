import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/account";
import { fulfillOrder } from "@/lib/orders/fulfill";
import { createServiceClient } from "@/lib/supabase/service";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
};

export default async function CartSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { order_id, session_id } = await searchParams;
  setRequestLocale(locale);

  const { user } = await requireUser(locale);
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/cart/success?order_id=${order_id ?? ""}`);
  }

  const t = await getTranslations("Cart");

  if (order_id) {
    const svc = createServiceClient();
    const { data: order } = await svc
      .from("orders")
      .select("id, user_id, status")
      .eq("id", order_id)
      .maybeSingle();

    if (order && order.user_id === user.id && order.status !== "paid" && session_id) {
      await fulfillOrder(svc, order.id, session_id);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Card>
        <CardContent className="space-y-4 py-10 text-center">
          <h1 className="font-heading text-2xl font-semibold">{t("successTitle")}</h1>
          <p className="text-muted-foreground">{t("successDesc")}</p>
          <Button nativeButton={false} render={<Link href="/account/courses" />}>
            {t("goToCourses")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
