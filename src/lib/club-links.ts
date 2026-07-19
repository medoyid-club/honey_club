export const CLUB_LINKS = {
  youtube: "https://www.youtube.com/@medoyid-club",
  telegram: "https://t.me/MedoyidClub",
  facebook: "https://www.facebook.com/medoyid.club",
  web: "https://www.medoyid-club.com/",
} as const;

export type ClubLinkKey = keyof typeof CLUB_LINKS;
