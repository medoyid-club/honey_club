export type VideoCategoryDef = {
  slug: string;
  nameRu: string;
  nameUk: string;
  nameEn: string;
  keywords: string[];
};

/** Small fixed set — infer from title, description, and tags. */
export const VIDEO_CATEGORY_DEFS: VideoCategoryDef[] = [
  {
    slug: "philosophy",
    nameRu: "Философия",
    nameUk: "Філософія",
    nameEn: "Philosophy",
    keywords: [
      "философ",
      "philosoph",
      "гabitus",
      "гabітус",
      "habitus",
      "гabитус",
      "stoic",
      "стоик",
      "эпикур",
      "платон",
      "субъект",
    ],
  },
  {
    slug: "psychology",
    nameRu: "Психология",
    nameUk: "Психологія",
    nameEn: "Psychology",
    keywords: [
      "психолог",
      "psycholog",
      "эмоци",
      "манипул",
      "тревог",
      "привыч",
      "личност",
      "поведен",
    ],
  },
  {
    slug: "society",
    nameRu: "Общество",
    nameUk: "Суспільство",
    nameEn: "Society",
    keywords: [
      "обществ",
      "society",
      "социум",
      "культур",
      "социальн",
      "соціум",
    ],
  },
  {
    slug: "interviews",
    nameRu: "Интервью",
    nameUk: "Інтерв'ю",
    nameEn: "Interviews",
    keywords: ["интервью", "interview", "эфир", "беседа", "подкаст", "разговор с"],
  },
];

export function inferVideoCategorySlug(text: string): string {
  const lower = text.toLowerCase();
  let bestSlug = "philosophy";
  let bestScore = 0;

  for (const def of VIDEO_CATEGORY_DEFS) {
    let score = 0;
    for (const keyword of def.keywords) {
      if (lower.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSlug = def.slug;
    }
  }

  return bestSlug;
}
