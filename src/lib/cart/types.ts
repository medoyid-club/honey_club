export type CartScope = "course" | "module";

export type CartItemRow = {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string | null;
  scope: CartScope;
  unit_price_cents: number;
  pricing_mode: "online" | "offline";
  title_snapshot: string;
  is_gift: boolean;
  gift_recipient_email: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  courseId: string;
  moduleId: string | null;
  scope: CartScope;
  unitPriceCents: number;
  pricingMode: "online" | "offline";
  title: string;
  isGift: boolean;
  giftRecipientEmail: string | null;
  courseSlug: string;
  authorPageId: string | null;
};

export type PromoCodeRow = {
  id: string;
  author_page_id: string;
  code: string;
  discount_percent: number;
  applies_to: "all" | "course" | "module";
  course_id: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  active: boolean;
  expires_at: string | null;
};

export function mapCartItem(
  row: CartItemRow,
  courseSlug: string,
  authorPageId: string | null
): CartItem {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    scope: row.scope,
    unitPriceCents: row.unit_price_cents,
    pricingMode: row.pricing_mode,
    title: row.title_snapshot,
    isGift: row.is_gift,
    giftRecipientEmail: row.gift_recipient_email,
    courseSlug,
    authorPageId,
  };
}
