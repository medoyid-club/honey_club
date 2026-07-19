export const CLUB_LINKS = {
  /** Основной YouTube-канал клуба (лекции, эфиры). */
  youtubePrimary: "https://www.youtube.com/@honey_erbe",
  /** Канал с курсами и анонсами. */
  youtube: "https://www.youtube.com/@medoyid-club",
  telegram: "https://t.me/MedoyidClub",
  facebook: "https://www.facebook.com/medoyid.club",
  web: "https://www.medoyid-club.com/",
} as const;

export type ClubLinkKey = keyof typeof CLUB_LINKS;
