"use client";

import { cn } from "@/lib/utils";

import type { FontPresetId } from "../_fonts/font-presets";
import { fontPresets, useFontLab } from "./font-lab-provider";

const cyrillicLabels = {
  full: "Кириллица ✓",
  partial: "Кириллица частично",
  "latin-only": "Только Latin",
} as const;

export function FontPicker() {
  const { preset, setPresetId } = useFontLab();

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium">Активная пара шрифтов</p>
        <p className="text-xs text-muted-foreground">
          Переключение меняет <code className="rounded bg-muted px-1">--font-sans</code> и{" "}
          <code className="rounded bg-muted px-1">--font-heading</code> для всей песочницы.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {fontPresets.map((item) => {
          const active = item.id === preset.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPresetId(item.id as FontPresetId)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/25 hover:bg-muted/50"
              )}
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {item.description}
              </span>
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  item.cyrillic === "full"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : item.cyrillic === "partial"
                      ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {cyrillicLabels[item.cyrillic]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SpecimenProps = {
  title: string;
  sansVar: string;
  headingVar: string;
  note?: string;
};

export function FontSpecimen({ title, sansVar, headingVar, note }: SpecimenProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      </div>

      <div style={{ ["--specimen-heading" as string]: headingVar, ["--specimen-sans" as string]: sansVar }}>
        <p
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--specimen-heading)" }}
        >
          Клуб медоедов
        </p>
        <p
          className="mt-1 text-lg"
          style={{ fontFamily: "var(--specimen-heading)" }}
        >
          Школа развития и личностного роста
        </p>
        <p
          className="mt-4 text-sm leading-relaxed text-muted-foreground"
          style={{ fontFamily: "var(--specimen-sans)" }}
        >
          Онлайн-курсы, лекции и семинары. The quick brown fox jumps over the lazy dog.
          Буквы їєіґ щастя — перевірка кирилиці для uk/ru локалей.
        </p>
        <p
          className="mt-3 text-xs uppercase tracking-wide text-muted-foreground"
          style={{ fontFamily: "var(--specimen-sans)" }}
        >
          0123456789 · €49 · 12 уроков · 8 часов
        </p>
      </div>
    </div>
  );
}
