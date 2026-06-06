"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  defaultFontPreset,
  fontPresets,
  type FontPreset,
  type FontPresetId,
} from "../_fonts/font-presets";

type FontLabContextValue = {
  preset: FontPreset;
  setPresetId: (id: FontPresetId) => void;
  style: CSSProperties;
};

const FontLabContext = createContext<FontLabContextValue | null>(null);

export function FontLabProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState<FontPresetId>(defaultFontPreset.id);

  const preset = useMemo(
    () => fontPresets.find((item) => item.id === presetId) ?? defaultFontPreset,
    [presetId]
  );

  const style = useMemo(
    () =>
      ({
        "--font-sans": preset.sans,
        "--font-heading": preset.heading,
      }) as CSSProperties,
    [preset]
  );

  const value = useMemo(
    () => ({
      preset,
      setPresetId,
      style,
    }),
    [preset, style]
  );

  return <FontLabContext.Provider value={value}>{children}</FontLabContext.Provider>;
}

export function useFontLab() {
  const context = useContext(FontLabContext);
  if (!context) {
    throw new Error("useFontLab must be used within FontLabProvider");
  }
  return context;
}

export { fontPresets };
