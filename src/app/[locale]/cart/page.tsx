import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import {
  checkoutCart,
  removeFromCart,
  updateCartItem,
} from "@/app/[locale]/cart/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/account";
import { getCartItems } from "@/lib/cart/db";
import { formatPrice } from "@/lib/courses";
import { calculateCartTotals } from "@/lib/promo/validate";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; added?: string; cancelled?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cart" });
  return { title: t("title") };
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function CartPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, added, cancelled } = await searchParams;
  setRequestLocale(locale);

  const { user } = await requireUser(locale);
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/cart`);
  }

  const t = await getTranslations("Cart");
  const supabase = await createClient();
  const items = await getCartItems(supabase, user.id);
  const totals = calculateCartTotals(items, null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8 space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {added && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {t("added")}
        </div>
      )}
      {cancelled && (
        <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          {t("cancelled")}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t(`errors.${error}` as "errors.empty")}
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("empty")}</p>
            <Button nativeButton={false} className="mt-4" render={<Link href="/courses" />}>
              {t("browseCourses")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link href={`/courses/${item.courseSlug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-heading text-lg font-semibold text-primary">
                  {item.unitPriceCents === 0 ? t("free") : formatPrice(item.unitPriceCents)}
                </p>

                <form action={updateCartItem} className="space-y-3 rounded-lg border border-border p-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_gift" defaultChecked={item.isGift} />
                    <span>{t("giftLabel")}</span>
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">{t("giftEmail")}</span>
                    <input
                      type="email"
                      name="gift_recipient_email"
                      defaultValue={item.giftRecipientEmail ?? ""}
                      placeholder="friend@example.com"
                      className={inputClass}
                    />
                  </label>
                  <Button type="submit" variant="outline" size="sm">
                    {t("saveGift")}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <form action={removeFromCart}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    {t("remove")}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}

          <Card>
            <CardContent className="space-y-4 pt-6">
              <form action={checkoutCart} className="space-y-4">
                <input type="hidden" name="locale" value={locale} />
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">{t("promoCode")}</span>
                  <input name="promo_code" placeholder="SUMMER20" className={inputClass} />
                </label>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("subtotal")}</dt>
                    <dd>{formatPrice(totals.subtotalCents)}</dd>
                  </div>
                </dl>

                <Button type="submit" className="w-full">
                  {t("checkout")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
