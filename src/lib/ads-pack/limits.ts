export const ADS_LIMITS = {
  headline: 30,
  longHeadline: 90,
  description: 90,
  callout: 25,
  path: 15,
  businessName: 25,
} as const;

export function trimAdsText(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > max * 0.6) return slice.slice(0, lastSpace).trim();
  return slice.trim();
}

export function normalizeCopyList(items: string[], maxLen: number, maxCount: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of items) {
    const text = trimAdsText(String(raw ?? ""), maxLen);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= maxCount) break;
  }

  return out;
}
