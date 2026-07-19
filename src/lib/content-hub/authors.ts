import { CLUB_LINKS } from "@/lib/club-links";
import type { AuthorKey, ContentLocale } from "@/lib/content-hub/types";

export type AuthorHubConfig = {
  key: AuthorKey;
  slug: string;
  hashtag: string;
  displayNameRu: string;
  subscribeTextRu: string;
  telegramChannelId: string;
  telegramUrl: string;
  facebookUrl: string | null;
};

function channelId(raw: string | undefined, fallback: string): string {
  const value = (raw ?? fallback).replace(/\s/g, "");
  if (value.startsWith("-100")) return value;
  return `-100${value}`;
}

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getAuthorConfigs(): AuthorHubConfig[] {
  const web = baseUrl();

  return [
    {
      key: "nata",
      slug: process.env.CONTENT_HUB_NATA_SLUG ?? "nata-ustymenko",
      hashtag: "#NataUstimenko",
      displayNameRu: "Ната Устименко",
      subscribeTextRu: "Нату Устименко",
      telegramChannelId: channelId(
        process.env.TELEGRAM_AUTHOR_NATA_CHANNEL_ID,
        "2197650405"
      ),
      telegramUrl: "https://t.me/nata_philosopher",
      facebookUrl: process.env.CONTENT_HUB_NATA_FACEBOOK_URL ?? null,
    },
    {
      key: "tetiana",
      slug: process.env.CONTENT_HUB_TETIANA_SLUG ?? "tetiana-gukalo",
      hashtag: "#TetianaGukalo",
      displayNameRu: "Тетяна Гукало",
      subscribeTextRu: "Тетяну Гукало",
      telegramChannelId: channelId(
        process.env.TELEGRAM_AUTHOR_TETIANA_CHANNEL_ID,
        "2194774103"
      ),
      telegramUrl: "https://t.me/tetianagukalo",
      facebookUrl: process.env.CONTENT_HUB_TETIANA_FACEBOOK_URL ?? null,
    },
  ];
}

export function getClubChannelId(): string {
  return channelId(process.env.TELEGRAM_CLUB_CHANNEL_ID, "4491478231");
}

export function findAuthorByChannelId(channelId: string): AuthorHubConfig | null {
  const normalized = channelId.replace(/\s/g, "");
  return getAuthorConfigs().find((a) => a.telegramChannelId === normalized) ?? null;
}

export function findAuthorBySlug(slug: string): AuthorHubConfig | null {
  return getAuthorConfigs().find((a) => a.slug === slug) ?? null;
}

export function authorWebUrl(author: AuthorHubConfig): string {
  return `${baseUrl()}/ru/authors/${author.slug}`;
}

function footerSubscribeLine(author: AuthorHubConfig, locale: ContentLocale): string {
  if (locale === "uk") {
    return `Підписуйтесь на ${author.displayNameRu} і Клуб медоедів.`;
  }
  if (locale === "en") {
    return `Follow ${author.displayNameRu} and Medoyid Club.`;
  }
  return `Подписывайтесь на ${author.subscribeTextRu} и Клуб медоедов.`;
}

export function buildAuthorFooterHtml(author: AuthorHubConfig, locale: ContentLocale = "ru"): string {
  const links = [
    `<a href="${CLUB_LINKS.web}">Web</a>`,
    `<a href="${CLUB_LINKS.telegram}">Telegram</a>`,
    `<a href="${CLUB_LINKS.youtubePrimary}">YouTube</a>`,
    `<a href="${CLUB_LINKS.facebook}">Facebook</a>`,
  ];
  return `${footerSubscribeLine(author, locale)}\n${links.join(" | ")}`;
}

export const CLUB_YOUTUBE_HANDLES = ["honey_erbe", "medoyid-club"] as const;
