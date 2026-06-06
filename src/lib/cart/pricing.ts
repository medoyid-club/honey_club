import {
  activePricing,
  type CourseStatus,
  type PricingMode,
} from "@/lib/courses";
import { applyPercentDiscount } from "@/lib/pricing";
import type { CartScope } from "@/lib/cart/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PricedLine = {
  courseId: string;
  moduleId: string | null;
  scope: CartScope;
  unitPriceCents: number;
  pricingMode: PricingMode;
  title: string;
  authorPageId: string | null;
};

export async function resolveCartLine(
  supabase: SupabaseClient,
  courseId: string,
  scope: CartScope,
  moduleId: string | null
): Promise<PricedLine | null> {
  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, status, title_ru, price_online_usd, price_offline_usd, author_page_id, sale_discount_percent"
    )
    .eq("id", courseId)
    .single();

  if (!course) return null;

  const pricing = activePricing(
    course.status as CourseStatus,
    course.price_online_usd,
    course.price_offline_usd
  );
  if (!pricing) return null;

  if (scope === "course") {
    return {
      courseId,
      moduleId: null,
      scope,
      unitPriceCents: applyPercentDiscount(
        pricing.priceUsd,
        course.sale_discount_percent
      ),
      pricingMode: pricing.mode,
      title: course.title_ru,
      authorPageId: course.author_page_id,
    };
  }

  if (!moduleId) return null;

  const { data: mod } = await supabase
    .from("course_modules")
    .select("id, title_ru, price_online_usd, price_offline_usd, sale_discount_percent")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .single();

  if (!mod) return null;

  const baseCents =
    pricing.mode === "online" ? mod.price_online_usd : mod.price_offline_usd;

  return {
    courseId,
    moduleId,
    scope,
    unitPriceCents: applyPercentDiscount(baseCents, mod.sale_discount_percent),
    pricingMode: pricing.mode,
    title: `${course.title_ru} — ${mod.title_ru}`,
    authorPageId: course.author_page_id,
  };
}

export async function userOwnsLine(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  courseId: string,
  scope: CartScope,
  moduleId: string | null
): Promise<boolean> {
  const { data } = await supabase
    .from("enrollments")
    .select("scope, module_id")
    .eq("course_id", courseId)
    .in("payment_status", ["free", "paid"])
    .or(
      `user_id.eq.${userId},and(is_gift.eq.true,gift_recipient_email.ilike.${userEmail})`
    );

  for (const row of data ?? []) {
    if (row.scope !== "module" || !row.module_id) {
      return true;
    }
    if (scope === "module" && row.module_id === moduleId) {
      return true;
    }
  }
  return false;
}
