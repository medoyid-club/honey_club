import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/courses";
import type { PriceDisplay } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  pricing: PriceDisplay | null;
  className?: string;
  size?: "sm" | "md";
};

export function CoursePrice({ pricing, className, size = "md" }: Props) {
  const t = useTranslations("Course");

  if (!pricing || pricing.currentCents === 0) {
    return (
      <span className={cn(size === "md" ? "font-heading text-base font-semibold" : "text-sm font-medium", className)}>
        {t("free")}
      </span>
    );
  }

  const hasSale =
    pricing.discountPercent != null &&
    pricing.discountPercent > 0 &&
    pricing.currentCents < pricing.originalCents;

  if (!hasSale) {
    return (
      <span
        className={cn(
          size === "md"
            ? "font-heading text-base font-semibold text-primary"
            : "text-sm font-medium",
          className
        )}
      >
        {formatPrice(pricing.currentCents)}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          size === "md"
            ? "font-heading text-base font-semibold text-primary"
            : "text-sm font-semibold text-primary"
        )}
      >
        {formatPrice(pricing.currentCents)}
      </span>
      <span
        className={cn(
          "text-muted-foreground line-through",
          size === "md" ? "text-sm" : "text-xs"
        )}
      >
        {formatPrice(pricing.originalCents)}
      </span>
      <Badge variant="secondary" className="bg-destructive/10 text-destructive">
        −{pricing.discountPercent}%
      </Badge>
    </span>
  );
}
