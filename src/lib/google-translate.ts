const API_URL = "https://translation.googleapis.com/language/translate/v2";

export type ContentLocale = "ru" | "uk" | "en";

const GOOGLE_LOCALE: Record<ContentLocale, string> = {
  ru: "ru",
  uk: "uk",
  en: "en",
};

type TranslateResponse = {
  data?: {
    translations?: { translatedText: string }[];
  };
  error?: { message?: string };
};

function getApiKey(): string {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  if (!key) {
    throw new Error("missing_api_key");
  }
  return key;
}

/** Splits long text into chunks under Google Translate's per-segment limit. */
function splitText(text: string, maxLen = 4500): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let rest = text;

  while (rest.length > maxLen) {
    let splitAt = rest.lastIndexOf("\n\n", maxLen);
    if (splitAt < maxLen * 0.4) splitAt = rest.lastIndexOf("\n", maxLen);
    if (splitAt < maxLen * 0.4) splitAt = maxLen;
    chunks.push(rest.slice(0, splitAt));
    rest = rest.slice(splitAt).trimStart();
  }

  if (rest) chunks.push(rest);
  return chunks;
}

export async function translateTexts(
  texts: string[],
  source: ContentLocale,
  target: ContentLocale
): Promise<string[]> {
  if (texts.length === 0) return [];
  if (source === target) return [...texts];

  const key = getApiKey();
  const url = `${API_URL}?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: GOOGLE_LOCALE[source],
      target: GOOGLE_LOCALE[target],
      format: "text",
    }),
  });

  const body = (await res.json()) as TranslateResponse;

  if (!res.ok) {
    throw new Error(body.error?.message || "translate_failed");
  }

  const out = body.data?.translations?.map((t) => t.translatedText) ?? [];
  if (out.length !== texts.length) {
    throw new Error("translate_failed");
  }

  return out;
}

export async function translateLongText(
  text: string,
  source: ContentLocale,
  target: ContentLocale
): Promise<string> {
  const chunks = splitText(text);
  const translated = await translateTexts(chunks, source, target);
  return translated.join("\n\n");
}
