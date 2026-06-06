"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearCart, getCartItems } from "@/lib/cart/db";
import { resolveCartLine, userOwnsLine } from "@/lib/cart/pricing";
import type { CartScope } from "@/lib/cart/types";
import { fulfillOrder } from "@/lib/orders/fulfill";
import { calculateCartTotals, validatePromoCode } from "@/lib/promo/validate";
import { getStripeClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getBaseUrl } from "@/lib/url";

function str(formData: FormData, key: string) {
  return ((formData.get(key) as string) || "").trim();
}

async function requireUserId(locale: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;
  if (!user?.sub) {
    redirect(`/${locale}/login?redirect=/${locale}/cart`);
  }
  return {
    supabase,
    userId: user.sub as string,
    email: (user.email as string | undefined) ?? "",
  };
}

export async function addToCart(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const slug = str(formData, "slug");
  const courseId = str(formData, "courseId");
  const scope = (str(formData, "scope") === "module" ? "module" : "course") as CartScope;
  const moduleId = scope === "module" ? str(formData, "moduleId") || null : null;

  const { supabase, userId, email } = await requireUserId(locale);

  const line = await resolveCartLine(supabase, courseId, scope, moduleId);
  if (!line) {
    redirect(`/${locale}/courses/${slug}?error=not_sellable`);
  }

  if (await userOwnsLine(supabase, userId, email, courseId, scope, moduleId)) {
    redirect(`/${locale}/courses/${slug}?error=already_owned`);
  }

  let removeQuery = supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", line.courseId);
  removeQuery = line.moduleId
    ? removeQuery.eq("module_id", line.moduleId)
    : removeQuery.is("module_id", null);
  await removeQuery;

  const { error } = await supabase.from("cart_items").insert({
    user_id: userId,
    course_id: line.courseId,
    module_id: line.moduleId,
    scope: line.scope,
    unit_price_cents: line.unitPriceCents,
    pricing_mode: line.pricingMode,
    title_snapshot: line.title,
    is_gift: false,
    gift_recipient_email: null,
  });

  if (error) {
    redirect(`/${locale}/courses/${slug}?error=cart_failed`);
  }

  revalidatePath(`/${locale}/cart`);
  redirect(`/${locale}/cart?added=1`);
}

export async function removeFromCart(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const itemId = str(formData, "itemId");
  const { supabase, userId } = await requireUserId(locale);

  await supabase.from("cart_items").delete().eq("id", itemId).eq("user_id", userId);
  revalidatePath(`/${locale}/cart`);
  redirect(`/${locale}/cart`);
}

export async function updateCartItem(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const itemId = str(formData, "itemId");
  const isGift = formData.get("is_gift") === "on";
  const giftEmail = str(formData, "gift_recipient_email").toLowerCase();

  const { supabase, userId } = await requireUserId(locale);

  if (isGift && !giftEmail) {
    redirect(`/${locale}/cart?error=gift_email`);
  }

  await supabase
    .from("cart_items")
    .update({
      is_gift: isGift,
      gift_recipient_email: isGift ? giftEmail : null,
    })
    .eq("id", itemId)
    .eq("user_id", userId);

  revalidatePath(`/${locale}/cart`);
  redirect(`/${locale}/cart`);
}

export async function checkoutCart(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const promoInput = str(formData, "promo_code");
  const { supabase, userId, email } = await requireUserId(locale);

  const items = await getCartItems(supabase, userId);
  if (items.length === 0) {
    redirect(`/${locale}/cart?error=empty`);
  }

  for (const item of items) {
    if (item.isGift && !item.giftRecipientEmail) {
      redirect(`/${locale}/cart?error=gift_email`);
    }
    if (
      !item.isGift &&
      (await userOwnsLine(
        supabase,
        userId,
        email,
        item.courseId,
        item.scope,
        item.moduleId
      ))
    ) {
      await supabase.from("cart_items").delete().eq("id", item.id);
    }
  }

  const freshItems = await getCartItems(supabase, userId);
  if (freshItems.length === 0) {
    redirect(`/${locale}/cart?error=empty`);
  }

  const authorPageIds = [
    ...new Set(freshItems.map((i) => i.authorPageId).filter(Boolean)),
  ] as string[];

  const svc = createServiceClient();
  const promo = promoInput
    ? await validatePromoCode(svc, promoInput, authorPageIds)
    : null;

  if (promoInput && !promo) {
    redirect(`/${locale}/cart?error=invalid_promo`);
  }

  const totals = calculateCartTotals(freshItems, promo);

  const { data: order, error: orderError } = await svc
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      promo_code_id: promo?.id ?? null,
      promo_code_text: promo?.code ?? null,
      subtotal_cents: totals.subtotalCents,
      discount_cents: totals.discountCents,
      total_cents: totals.totalCents,
      locale,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    redirect(`/${locale}/cart?error=checkout_failed`);
  }

  await svc.from("order_items").insert(
    totals.lines.map((line) => ({
      order_id: order.id,
      course_id: line.courseId,
      module_id: line.moduleId,
      scope: line.scope,
      unit_price_cents: line.unitPriceCents,
      discount_cents: line.discountCents,
      final_price_cents: line.finalPriceCents,
      pricing_mode: line.pricingMode,
      title_snapshot: line.title,
      is_gift: line.isGift,
      gift_recipient_email: line.isGift ? line.giftRecipientEmail : null,
    }))
  );

  if (totals.totalCents <= 0) {
    await fulfillOrder(svc, order.id, `free-${order.id}`);
    revalidatePath(`/${locale}/cart`);
    redirect(`/${locale}/account/courses?purchased=1`);
  }

  const baseUrl = getBaseUrl();
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    line_items: totals.lines
      .filter((line) => line.finalPriceCents > 0)
      .map((line) => ({
        price_data: {
          currency: "eur",
          unit_amount: line.finalPriceCents,
          product_data: { name: line.title },
        },
        quantity: 1,
      })),
    mode: "payment",
    success_url: `${baseUrl}/${locale}/cart/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/cart?cancelled=1`,
    customer_email: email,
    metadata: {
      order_id: order.id,
      user_id: userId,
      locale,
    },
  });

  await svc.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  redirect(session.url!);
}

export async function enrollFree(formData: FormData) {
  const courseId = str(formData, "courseId");
  const locale = str(formData, "locale") || "ru";
  const slug = str(formData, "slug");

  const { userId } = await requireUserId(locale);

  const svc = createServiceClient();
  await svc
    .from("enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("payment_status", ["pending", "failed"])
    .is("module_id", null);

  await svc.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    scope: "course",
    payment_status: "free",
  });

  redirect(`/${locale}/courses/${slug}?enrolled=1`);
}
