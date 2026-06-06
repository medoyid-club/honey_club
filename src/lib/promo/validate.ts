import type { CartItem, PromoCodeRow } from "@/lib/cart/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PricedCartLine = CartItem & {
  authorPageId: string | null;
  discountCents: number;
  finalPriceCents: number;
};

export type CartTotals = {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  lines: PricedCartLine[];
  promo: PromoCodeRow | null;
};

function itemAppliesToPromo(
  item: CartItem & { authorPageId: string | null },
  promo: PromoCodeRow
): boolean {
  if (promo.applies_to === "course" && item.scope !== "course") return false;
  if (promo.applies_to === "module" && item.scope !== "module") return false;
  if (promo.course_id && promo.course_id !== item.courseId) return false;
  return promo.author_page_id === item.authorPageId;
}

export async function validatePromoCode(
  svc: SupabaseClient,
  code: string,
  authorPageIds: string[]
): Promise<PromoCodeRow | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data } = await svc
    .from("promo_codes")
    .select("*")
    .eq("active", true)
    .in("author_page_id", authorPageIds);

  const row = ((data as PromoCodeRow[] | null) ?? []).find(
    (p) => p.code.toUpperCase() === normalized
  );
  if (!row) return null;

  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
  if (row.max_redemptions != null && row.redemption_count >= row.max_redemptions) {
    return null;
  }

  return row;
}

export function calculateCartTotals(
  lines: (CartItem & { authorPageId: string | null })[],
  promo: PromoCodeRow | null
): CartTotals {
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents, 0);

  if (!promo || subtotalCents === 0) {
    return {
      subtotalCents,
      discountCents: 0,
      totalCents: subtotalCents,
      promo: null,
      lines: lines.map((line) => ({
        ...line,
        discountCents: 0,
        finalPriceCents: line.unitPriceCents,
      })),
    };
  }

  let discountCents = 0;
  const priced: PricedCartLine[] = lines.map((line) => {
    if (!itemAppliesToPromo(line, promo)) {
      return { ...line, discountCents: 0, finalPriceCents: line.unitPriceCents };
    }
    const lineDiscount = Math.round(
      (line.unitPriceCents * promo.discount_percent) / 100
    );
    discountCents += lineDiscount;
    return {
      ...line,
      discountCents: lineDiscount,
      finalPriceCents: Math.max(line.unitPriceCents - lineDiscount, 0),
    };
  });

  return {
    subtotalCents,
    discountCents,
    totalCents: Math.max(subtotalCents - discountCents, 0),
    promo,
    lines: priced,
  };
}
