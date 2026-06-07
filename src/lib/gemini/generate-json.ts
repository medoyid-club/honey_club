type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly code: "missing_api_key" | "gemini_failed" | "gemini_empty" | "invalid_json"
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export async function generateGeminiJson<T>(prompt: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not configured", "missing_api_key");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    }),
  });

  if (!response.ok) {
    throw new GeminiError(`Gemini API error (${response.status})`, "gemini_failed");
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new GeminiError("Empty Gemini response", "gemini_empty");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GeminiError("Gemini returned invalid JSON", "invalid_json");
  }
}
