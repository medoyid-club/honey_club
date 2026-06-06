"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string) {
  return ((formData.get(key) as string) || "").trim();
}

function int(formData: FormData, key: string): number {
  const v = parseInt(str(formData, key), 10);
  return Number.isFinite(v) ? v : 0;
}

export async function createPromoCode(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const { page } = await getStudioContext(locale);

  const code = str(formData, "code").toUpperCase();
  const discountPercent = int(formData, "discount_percent");
  const maxRedemptionsRaw = str(formData, "max_redemptions");
  const maxRedemptions = maxRedemptionsRaw ? int(formData, "max_redemptions") : null;

  if (!code || discountPercent < 1 || discountPercent > 100) {
    redirect(`/${locale}/studio/promo-codes?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").insert({
    author_page_id: page.id,
    code,
    discount_percent: discountPercent,
    max_redemptions: maxRedemptions && maxRedemptions > 0 ? maxRedemptions : null,
    active: true,
  });

  if (error) {
    redirect(`/${locale}/studio/promo-codes?error=duplicate`);
  }

  revalidatePath(`/${locale}/studio/promo-codes`);
  redirect(`/${locale}/studio/promo-codes?created=1`);
}

export async function togglePromoCode(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const promoId = str(formData, "promoId");
  const active = formData.get("active") === "true";

  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  await supabase
    .from("promo_codes")
    .update({ active })
    .eq("id", promoId)
    .eq("author_page_id", page.id);

  revalidatePath(`/${locale}/studio/promo-codes`);
  redirect(`/${locale}/studio/promo-codes`);
}

export async function deletePromoCode(formData: FormData) {
  const locale = str(formData, "locale") || "ru";
  const promoId = str(formData, "promoId");

  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  await supabase
    .from("promo_codes")
    .delete()
    .eq("id", promoId)
    .eq("author_page_id", page.id);

  revalidatePath(`/${locale}/studio/promo-codes`);
  redirect(`/${locale}/studio/promo-codes`);
}
