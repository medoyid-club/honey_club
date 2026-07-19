import type { ContentLocale } from "@/lib/content-hub/types";

const CYRILLIC_UK = /[іїєґ]/i;
const CYRILLIC_RU = /[ёыэ]/i;
const LATIN = /[a-z]/i;

/** Heuristic locale from author post text (fallback if Gemini mislabels). */
export function detectLocaleFromText(text: string): ContentLocale {
  const sample = text.trim().slice(0, 2000);
  if (!sample) return "ru";

  if (CYRILLIC_UK.test(sample)) return "uk";
  if (CYRILLIC_RU.test(sample)) return "ru";

  const latin = (sample.match(/[a-zA-Z]/g) ?? []).length;
  const cyrillic = (sample.match(/[\u0400-\u04FF]/g) ?? []).length;
  if (latin > cyrillic * 2 && latin > 20) return "en";
  if (cyrillic > 0) return "ru";

  return "ru";
}

export function reconcileBlogLocale(
  geminiLocale: ContentLocale | undefined,
  sourceText: string
): ContentLocale {
  const detected = detectLocaleFromText(sourceText);
  if (!geminiLocale) return detected;
  if (geminiLocale === detected) return geminiLocale;
  // Prefer script-based detection when Gemini conflicts (e.g. UK text + RU title)
  if (detected === "uk" && geminiLocale === "ru") return "uk";
  if (detected === "ru" && geminiLocale === "uk" && CYRILLIC_RU.test(sourceText)) return "ru";
  return geminiLocale;
}
