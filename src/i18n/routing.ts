import { defineRouting } from "next-intl/routing";

export const locales = ["uk", "en", "ru"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  uk: "Українська",
  en: "English",
  ru: "Русский",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
});
