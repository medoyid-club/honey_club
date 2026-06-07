export type AdsPackLocale = "ru" | "uk" | "en";

export type AdsPackLink = {
  locale: AdsPackLocale;
  label: string;
  url: string;
  urlWithUtm: string;
};

export type AdsPackMedia = {
  coverUrl: string | null;
  overviewVideoUrl: string | null;
  imageNotes: string[];
};

export type AdsPackPricing = {
  status: string;
  originalPriceEur: string | null;
  currentPriceEur: string | null;
  discountPercent: number | null;
  isFree: boolean;
};

export type AdsPackCopy = {
  headlines: string[];
  longHeadlines: string[];
  descriptions: string[];
  keywords: string[];
  callouts: string[];
  path1: string;
  path2: string;
  businessName: string;
};

export type GoogleAdsPack = {
  generatedAt: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  authorName: string;
  authorSlug: string | null;
  primaryLocale: AdsPackLocale;
  links: AdsPackLink[];
  utmTemplate: string;
  pricing: AdsPackPricing;
  media: AdsPackMedia;
  copy: AdsPackCopy;
  conversionEvents: string[];
  checklist: string[];
  aiGenerated: boolean;
};

export type GeminiAdsCopy = {
  headlines: string[];
  longHeadlines: string[];
  descriptions: string[];
  keywords: string[];
  callouts: string[];
  path1: string;
  path2: string;
  businessName: string;
};
