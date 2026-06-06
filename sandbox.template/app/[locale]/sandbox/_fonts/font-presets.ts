export type FontPresetId =
  | "geist"
  | "ibm-plex"
  | "libre-franklin"
  | "iosevka-charon"
  | "ibm-heading-franklin"
  | "charon-heading-ibm";

export type FontPreset = {
  id: FontPresetId;
  label: string;
  description: string;
  sans: string;
  heading: string;
  cyrillic: "full" | "partial" | "latin-only";
};

export const fontPresets: FontPreset[] = [
  {
    id: "geist",
    label: "Geist",
    description: "Текущий шрифт сайта — нейтральный UI sans.",
    sans: "var(--font-geist)",
    heading: "var(--font-geist)",
    cyrillic: "full",
  },
  {
    id: "ibm-plex",
    label: "IBM Plex Sans",
    description: "Техничный, спокойный. Хорош для длинных текстов и интерфейса.",
    sans: "var(--font-ibm-plex-sans)",
    heading: "var(--font-ibm-plex-sans)",
    cyrillic: "full",
  },
  {
    id: "libre-franklin",
    label: "Libre Franklin",
    description: "Гротеск в духе Franklin Gothic. Только latin — кириллица уйдёт в fallback.",
    sans: "var(--font-libre-franklin)",
    heading: "var(--font-libre-franklin)",
    cyrillic: "latin-only",
  },
  {
    id: "iosevka-charon",
    label: "Iosevka Charon",
    description: "Квази‑пропорциональный Iosevka — плотный, «инженерный» характер.",
    sans: "var(--font-iosevka-charon)",
    heading: "var(--font-iosevka-charon)",
    cyrillic: "full",
  },
  {
    id: "ibm-heading-franklin",
    label: "Franklin + IBM",
    description: "Заголовки Libre Franklin, текст IBM Plex Sans.",
    sans: "var(--font-ibm-plex-sans)",
    heading: "var(--font-libre-franklin)",
    cyrillic: "partial",
  },
  {
    id: "charon-heading-ibm",
    label: "IBM + Charon",
    description: "Заголовки Iosevka Charon, текст IBM Plex Sans.",
    sans: "var(--font-ibm-plex-sans)",
    heading: "var(--font-iosevka-charon)",
    cyrillic: "full",
  },
];

export const defaultFontPreset = fontPresets[1]!;

export const iosevkaCharonFamily =
  '"Iosevka Charon", ui-sans-serif, system-ui, sans-serif';
