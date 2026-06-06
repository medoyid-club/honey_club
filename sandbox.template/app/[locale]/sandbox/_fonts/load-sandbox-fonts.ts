import type { CSSProperties } from "react";
import {
  Geist,
  IBM_Plex_Sans,
  Libre_Franklin,
} from "next/font/google";

import "@fontsource/iosevka-charon/latin.css";
import "@fontsource/iosevka-charon/cyrillic.css";

import { iosevkaCharonFamily } from "./font-presets";

export const fontGeist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "cyrillic"],
});

export const fontIbmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const fontLibreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const sandboxFontVariables = [
  fontGeist.variable,
  fontIbmPlexSans.variable,
  fontLibreFranklin.variable,
].join(" ");

export const sandboxFontStyles = {
  "--font-iosevka-charon": iosevkaCharonFamily,
} as CSSProperties;
