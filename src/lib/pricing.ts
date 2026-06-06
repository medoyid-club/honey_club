import { activePricing, type CourseStatus, type PricingMode } from "@/lib/courses";

export type PriceDisplay = {
  originalCents: number;
  currentCents: number;
  discountPercent: number | null;
  mode: PricingMode | null;
};

export function applyPercentDiscount(
  priceCents: number,
  discountPercent: number | null | undefined
): number {
  if (!discountPercent || discountPercent <= 0 || priceCents <= 0) return priceCents;
  return Math.max(Math.round(priceCents * (1 - discountPercent / 100)), 0);
}

export function priceWithSale(
  baseCents: number,
  saleDiscountPercent: number | null | undefined
): PriceDisplay {
  const discount =
    saleDiscountPercent && saleDiscountPercent > 0 ? saleDiscountPercent : null;
  const currentCents = applyPercentDiscount(baseCents, discount);
  return {
    originalCents: baseCents,
    currentCents: currentCents,
    discountPercent: discount,
    mode: null,
  };
}

export function courseDisplayPrice(params: {
  status: CourseStatus;
  priceOnlineUsd: number;
  priceOfflineUsd: number;
  saleDiscountPercent?: number | null;
}): PriceDisplay | null {
  const pricing = activePricing(
    params.status,
    params.priceOnlineUsd,
    params.priceOfflineUsd
  );
  if (!pricing) return null;

  const withSale = priceWithSale(pricing.priceUsd, params.saleDiscountPercent);
  return { ...withSale, mode: pricing.mode };
}

export function moduleDisplayPrice(params: {
  pricingMode: PricingMode;
  priceOnlineUsd: number;
  priceOfflineUsd: number;
  saleDiscountPercent?: number | null;
}): PriceDisplay {
  const base =
    params.pricingMode === "online" ? params.priceOnlineUsd : params.priceOfflineUsd;
  const withSale = priceWithSale(base, params.saleDiscountPercent);
  return { ...withSale, mode: params.pricingMode };
}
