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

export type PromoScopeItem = {
  courseId: string;
  moduleId: string | null;
};

export type PromoCodeWithScopes = PromoCodeRow & {
  scopes: PromoScopeItem[];
};

function itemAppliesToPromo(
  item: CartItem & { authorPageId: string | null },
  promo: PromoCodeWithScopes
): boolean {
  if (promo.author_page_id !== item.authorPageId) return false;

  if (promo.scopes.length > 0) {
    return promo.scopes.some((scope) => {
      if (scope.courseId !== item.courseId) return false;
      if (scope.moduleId === null) return true;
      return item.scope === "module" && item.moduleId === scope.moduleId;
    });
  }

  if (promo.applies_to === "all") return true;
  if (promo.applies_to === "course") {
    return item.scope === "course" && promo.course_id === item.courseId;
  }
  if (promo.applies_to === "module") {
    return item.scope === "module" && promo.course_id === item.courseId;
  }
  return false;
}

async function attachPromoScopes(
  svc: SupabaseClient,
  rows: PromoCodeRow[]
): Promise<PromoCodeWithScopes[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const { data: scopeRows } = await svc
    .from("promo_code_items")
    .select("promo_code_id, course_id, module_id")
    .in("promo_code_id", ids);

  const scopesByPromo = new Map<string, PromoScopeItem[]>();
  for (const row of scopeRows ?? []) {
    const list = scopesByPromo.get(row.promo_code_id as string) ?? [];
    list.push({
      courseId: row.course_id as string,
      moduleId: (row.module_id as string | null) ?? null,
    });
    scopesByPromo.set(row.promo_code_id as string, list);
  }

  return rows.map((row) => ({
    ...row,
    scopes: scopesByPromo.get(row.id) ?? [],
  }));
}

export async function validatePromoCode(
  svc: SupabaseClient,
  code: string,
  authorPageIds: string[]
): Promise<PromoCodeWithScopes | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized || authorPageIds.length === 0) return null;

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

  const [withScopes] = await attachPromoScopes(svc, [row]);
  return withScopes ?? null;
}

export function calculateCartTotals(
  lines: (CartItem & { authorPageId: string | null })[],
  promo: PromoCodeWithScopes | null
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
