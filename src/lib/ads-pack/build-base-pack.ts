import type { DbCourse } from "@/lib/courses";
import { formatPrice } from "@/lib/courses";
import { courseDisplayPrice } from "@/lib/pricing";
import { getBaseUrl } from "@/lib/url";

import type { AdsPackLocale, GoogleAdsPack } from "./types";

const LOCALES: AdsPackLocale[] = ["ru", "uk", "en"];

const LOCALE_LABELS: Record<AdsPackLocale, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
};

function pickTitle(course: DbCourse, locale: AdsPackLocale): string {
  if (locale === "uk") return course.title_uk || course.title_ru;
  if (locale === "en") return course.title_en || course.title_ru;
  return course.title_ru;
}

function buildUtmUrl(baseUrl: string, locale: AdsPackLocale, slug: string, campaign: string) {
  const url = new URL(`/${locale}/courses/${slug}`, baseUrl);
  url.searchParams.set("utm_source", "google");
  url.searchParams.set("utm_medium", "cpc");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", slug);
  return url.toString();
}

export function buildBaseGoogleAdsPack(params: {
  course: DbCourse;
  authorName: string;
  authorSlug: string | null;
  primaryLocale: AdsPackLocale;
}): GoogleAdsPack {
  const { course, authorName, authorSlug, primaryLocale } = params;
  const baseUrl = getBaseUrl();
  const campaignSlug = course.slug.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40);
  const pricingView = courseDisplayPrice({
    status: course.status,
    priceOnlineUsd: course.price_online_usd,
    priceOfflineUsd: course.price_offline_usd,
    saleDiscountPercent: course.sale_discount_percent,
  });

  const isFree = !pricingView || pricingView.currentCents === 0;

  return {
    generatedAt: new Date().toISOString(),
    courseId: course.id,
    courseTitle: pickTitle(course, primaryLocale),
    courseSlug: course.slug,
    authorName,
    authorSlug,
    primaryLocale,
    links: LOCALES.map((locale) => ({
      locale,
      label: LOCALE_LABELS[locale],
      url: `${baseUrl}/${locale}/courses/${course.slug}`,
      urlWithUtm: buildUtmUrl(baseUrl, locale, course.slug, campaignSlug),
    })),
    utmTemplate:
      "utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content={ad_group}&utm_term={keyword}",
    pricing: {
      status: course.status,
      originalPriceEur:
        pricingView && !isFree ? formatPrice(pricingView.originalCents) : null,
      currentPriceEur:
        pricingView && !isFree ? formatPrice(pricingView.currentCents) : null,
      discountPercent: pricingView?.discountPercent ?? null,
      isFree,
    },
    media: {
      coverUrl: course.cover_url,
      overviewVideoUrl: course.overview_video_url,
      imageNotes: [
        "Landscape 1.91:1 (1200×628) — Performance Max / Display",
        "Square 1:1 (1200×1200) — Performance Max",
        "Portrait 4:5 (960×1200) — optional for some placements",
        "Logo 1:1 (1200×1200) — author avatar or brand mark if available",
      ],
    },
    copy: {
      headlines: [],
      longHeadlines: [],
      descriptions: [],
      keywords: [],
      callouts: [],
      path1: course.slug.slice(0, 15),
      path2: "course",
      businessName: trimBusinessName(authorName),
    },
    conversionEvents: [
      "page_view — course landing",
      "add_to_cart — added course to cart",
      "purchase — Stripe checkout completed",
    ],
    checklist: [
      "Connect Google Ads to the same domain as NEXT_PUBLIC_BASE_URL",
      "Install Google tag (gtag) or import conversions from GA4",
      "Map purchase / add_to_cart as primary conversions",
      "Use the UTM landing URL as Final URL in ads",
      "Review all AI-generated texts for policy compliance before publishing",
      "Do not use guaranteed results or medical claims in ad copy",
      "Upload cover image in required sizes (see media notes)",
      "If using video ads, link overview video or upload to YouTube",
    ],
    aiGenerated: false,
  };
}

function trimBusinessName(name: string): string {
  const cleaned = name.replace(/\s+/g, " ").trim();
  return cleaned.length <= 25 ? cleaned : cleaned.slice(0, 25).trim();
}
