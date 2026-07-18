const YOUTUBE_ID_IN_URL =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;

const YOUTUBE_ID_STANDALONE = /^[a-zA-Z0-9_-]{11}$/;

/** Extract 11-char YouTube video ID from a URL or raw id string. */
export function parseYoutubeId(input: string): string {
  const raw = input.trim();
  if (!raw) return raw;

  const fromUrl = raw.match(YOUTUBE_ID_IN_URL);
  if (fromUrl?.[1]) return fromUrl[1];

  if (YOUTUBE_ID_STANDALONE.test(raw)) return raw;

  return raw;
}

/** Returns canonical 11-char id, or null if input is not a valid YouTube video id. */
export function normalizeYoutubeId(input: string): string | null {
  const parsed = parseYoutubeId(input);
  return YOUTUBE_ID_STANDALONE.test(parsed) ? parsed : null;
}

export function uniqueYoutubeIds(inputs: string[]): string[] {
  const ids = new Set<string>();
  for (const input of inputs) {
    const id = normalizeYoutubeId(input);
    if (id) ids.add(id);
  }
  return [...ids];
}
