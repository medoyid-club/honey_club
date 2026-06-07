import { generateGeminiJson, GeminiError } from "@/lib/gemini/generate-json";
import type { DbCourse } from "@/lib/courses";

import { ADS_LIMITS, normalizeCopyList, trimAdsText } from "./limits";
import type { AdsPackLocale, GeminiAdsCopy, GoogleAdsPack } from "./types";

function pickText(
  course: DbCourse,
  field: "title" | "summary" | "description",
  locale: AdsPackLocale
): string {
  if (field === "title") {
    if (locale === "uk") return course.title_uk || course.title_ru;
    if (locale === "en") return course.title_en || course.title_ru;
    return course.title_ru;
  }
  if (field === "summary") {
    if (locale === "uk") return course.summary_uk || course.summary_ru;
    if (locale === "en") return course.summary_en || course.summary_ru;
    return course.summary_ru;
  }
  if (locale === "uk") return course.description_uk || course.description_ru || "";
  if (locale === "en") return course.description_en || course.description_ru || "";
  return course.description_ru || "";
}

function buildPrompt(params: {
  course: DbCourse;
  authorName: string;
  pack: GoogleAdsPack;
  locale: AdsPackLocale;
}): string {
  const { course, authorName, pack, locale } = params;

  const context = {
    locale,
    courseTitle: pickText(course, "title", locale),
    summary: pickText(course, "summary", locale),
    description: pickText(course, "description", locale),
    authorName,
    tags: course.tags,
    format: course.format,
    level: course.level,
    status: course.status,
    pricing: pack.pricing,
    landingUrl: pack.links.find((l) => l.locale === locale)?.urlWithUtm ?? pack.links[0]?.urlWithUtm,
  };

  return `You are a Google Ads copywriter for an online education platform.
Generate ad copy in language matching locale "${locale}" (ru=Russian, uk=Ukrainian, en=English).

STRICT RULES:
- Respect character limits (headlines max ${ADS_LIMITS.headline}, longHeadlines max ${ADS_LIMITS.longHeadline}, descriptions max ${ADS_LIMITS.description}, callouts max ${ADS_LIMITS.callout}, path segments max ${ADS_LIMITS.path}, businessName max ${ADS_LIMITS.businessName})
- No guaranteed results, no medical/therapeutic promises, no manipulative claims about outcomes
- Focus on education, skills, author expertise, course structure
- Mention discount or price only if provided in pricing object
- Return ONLY valid JSON matching this schema:
{
  "headlines": string[] (10-15 items),
  "longHeadlines": string[] (3-5 items),
  "descriptions": string[] (4 items),
  "keywords": string[] (15-25 items, lowercase),
  "callouts": string[] (4-6 items),
  "path1": string,
  "path2": string,
  "businessName": string
}

Course context:
${JSON.stringify(context, null, 2)}`;
}

function applyGeminiCopy(pack: GoogleAdsPack, raw: GeminiAdsCopy): GoogleAdsPack {
  return {
    ...pack,
    aiGenerated: true,
    copy: {
      headlines: normalizeCopyList(raw.headlines ?? [], ADS_LIMITS.headline, 15),
      longHeadlines: normalizeCopyList(
        raw.longHeadlines ?? [],
        ADS_LIMITS.longHeadline,
        5
      ),
      descriptions: normalizeCopyList(raw.descriptions ?? [], ADS_LIMITS.description, 4),
      keywords: normalizeCopyList(raw.keywords ?? [], 80, 25).map((k) => k.toLowerCase()),
      callouts: normalizeCopyList(raw.callouts ?? [], ADS_LIMITS.callout, 6),
      path1: trimAdsText(raw.path1 || pack.copy.path1, ADS_LIMITS.path),
      path2: trimAdsText(raw.path2 || pack.copy.path2, ADS_LIMITS.path),
      businessName: trimAdsText(raw.businessName || pack.copy.businessName, ADS_LIMITS.businessName),
    },
  };
}

export async function enrichGoogleAdsPackWithGemini(params: {
  course: DbCourse;
  authorName: string;
  pack: GoogleAdsPack;
  locale: AdsPackLocale;
}): Promise<GoogleAdsPack> {
  try {
    const raw = await generateGeminiJson<GeminiAdsCopy>(
      buildPrompt(params)
    );
    return applyGeminiCopy(params.pack, raw);
  } catch (err) {
    if (err instanceof GeminiError) throw err;
    throw new GeminiError("Gemini enrichment failed", "gemini_failed");
  }
}
