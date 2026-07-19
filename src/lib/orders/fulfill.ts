import { sendEmail } from "@/lib/email/resend";
import { getBaseUrl } from "@/lib/url";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function claimPendingGifts(
  svc: SupabaseClient,
  userId: string,
  email: string
): Promise<number> {
  const { data } = await svc
    .from("enrollments")
    .update({ user_id: userId })
    .is("user_id", null)
    .eq("is_gift", true)
    .ilike("gift_recipient_email", email)
    .in("payment_status", ["free", "paid"])
    .select("id");

  return data?.length ?? 0;
}

export async function sendGiftAccessEmail(params: {
  to: string;
  itemTitle: string;
  locale: string;
}) {
  const baseUrl = getBaseUrl();
  const loginUrl = `${baseUrl}/${params.locale}/login?redirect=/${params.locale}/account/courses`;

  const subject =
    params.locale === "uk"
      ? "Вам подарували доступ до курсу"
      : params.locale === "en"
        ? "You received a course gift"
        : "Вам подарили доступ к курсу";

  const html =
    params.locale === "uk"
      ? `<p>Вам подарували доступ: <strong>${params.itemTitle}</strong>.</p><p><a href="${loginUrl}">Увійдіть або зареєструйтесь</a> під цією адресою e-mail, щоб побачити курс у кабінеті.</p>`
      : params.locale === "en"
        ? `<p>You received access to: <strong>${params.itemTitle}</strong>.</p><p><a href="${loginUrl}">Sign in or register</a> with this email to see the course in your account.</p>`
        : `<p>Вам подарили доступ: <strong>${params.itemTitle}</strong>.</p><p><a href="${loginUrl}">Войдите или зарегистрируйтесь</a> под этим e-mail, чтобы увидеть курс в кабинете.</p>`;

  try {
    return await sendEmail({
      to: params.to,
      subject,
      html,
      from: "noreply",
      replyTo: "courses",
    });
  } catch (err) {
    console.error("[gift-email]", err);
    return { id: null, error: "send_failed" };
  }
}

export async function fulfillOrder(
  svc: SupabaseClient,
  orderId: string,
  stripeSessionId: string
) {
  const { data: order } = await svc
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status === "paid") return;

  const { count: existingCount } = await svc
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);

  if ((existingCount ?? 0) > 0) {
    await svc
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString(), stripe_session_id: stripeSessionId })
      .eq("id", orderId);
    return;
  }

  const { data: items } = await svc
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (!items?.length) return;

  for (const item of items) {
    await svc.from("enrollments").insert({
      user_id: item.is_gift ? null : order.user_id,
      course_id: item.course_id,
      module_id: item.scope === "module" ? item.module_id : null,
      scope: item.scope,
      pricing_mode: item.pricing_mode,
      payment_status: item.final_price_cents === 0 ? "free" : "paid",
      is_gift: item.is_gift,
      gift_recipient_email: item.is_gift ? item.gift_recipient_email : null,
      gifted_by_user_id: item.is_gift ? order.user_id : null,
      order_id: orderId,
      stripe_session_id: stripeSessionId,
      paid_at: new Date().toISOString(),
    });

    if (item.is_gift && item.gift_recipient_email) {
      await sendGiftAccessEmail({
        to: item.gift_recipient_email,
        itemTitle: item.title_snapshot,
        locale: order.locale ?? "ru",
      });
    }
  }

  await svc
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_session_id: stripeSessionId,
    })
    .eq("id", orderId);

  if (order.promo_code_id) {
    const { data: promo } = await svc
      .from("promo_codes")
      .select("redemption_count")
      .eq("id", order.promo_code_id)
      .single();

    if (promo) {
      await svc
        .from("promo_codes")
        .update({ redemption_count: (promo.redemption_count ?? 0) + 1 })
        .eq("id", order.promo_code_id);
    }
  }

  await svc.from("cart_items").delete().eq("user_id", order.user_id);
}
