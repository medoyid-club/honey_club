import {
  translateLongText,
  translateTexts,
  type ContentLocale,
} from "@/lib/google-translate";

const LOCALES: ContentLocale[] = ["ru", "uk", "en"];

export type FillEmptyTranslationsInput = {
  fieldBases: string[];
  fields: Record<string, string>;
};

export type FillEmptyTranslationsResult =
  | { ok: true; updates: Record<string, string> }
  | { ok: false; error: string };

function readField(fields: Record<string, string>, base: string, locale: ContentLocale) {
  return (fields[`${base}_${locale}`] ?? "").trim();
}

function findSource(
  fields: Record<string, string>,
  base: string
): { locale: ContentLocale; text: string } | null {
  for (const locale of LOCALES) {
    const text = readField(fields, base, locale);
    if (text) return { locale, text };
  }
  return null;
}

export async function fillEmptyTranslations(
  input: FillEmptyTranslationsInput
): Promise<FillEmptyTranslationsResult> {
  const updates: Record<string, string> = {};

  type Job = {
    base: string;
    sourceLocale: ContentLocale;
    sourceText: string;
    targetLocale: ContentLocale;
  };

  const jobs: Job[] = [];

  for (const base of input.fieldBases) {
    const source = findSource(input.fields, base);
    if (!source) continue;

    for (const targetLocale of LOCALES) {
      if (targetLocale === source.locale) continue;
      if (readField(input.fields, base, targetLocale)) continue;
      jobs.push({
        base,
        sourceLocale: source.locale,
        sourceText: source.text,
        targetLocale,
      });
    }
  }

  if (jobs.length === 0) {
    return { ok: false, error: "nothing_to_fill" };
  }

  const byTarget = new Map<ContentLocale, Job[]>();
  for (const job of jobs) {
    const list = byTarget.get(job.targetLocale) ?? [];
    list.push(job);
    byTarget.set(job.targetLocale, list);
  }

  try {
    for (const [targetLocale, targetJobs] of byTarget) {
      const shortJobs: Job[] = [];
      const longJobs: Job[] = [];

      for (const job of targetJobs) {
        if (job.sourceText.length > 4500) longJobs.push(job);
        else shortJobs.push(job);
      }

      if (shortJobs.length > 0) {
        const bySource = new Map<ContentLocale, Job[]>();
        for (const job of shortJobs) {
          const list = bySource.get(job.sourceLocale) ?? [];
          list.push(job);
          bySource.set(job.sourceLocale, list);
        }

        for (const [sourceLocale, sourceJobs] of bySource) {
          const texts = sourceJobs.map((j) => j.sourceText);
          const translated = await translateTexts(texts, sourceLocale, targetLocale);
          sourceJobs.forEach((job, i) => {
            updates[`${job.base}_${targetLocale}`] = translated[i];
          });
        }
      }

      for (const job of longJobs) {
        updates[`${job.base}_${targetLocale}`] = await translateLongText(
          job.sourceText,
          job.sourceLocale,
          targetLocale
        );
      }
    }

    return { ok: true, updates };
  } catch (err) {
    const message = err instanceof Error ? err.message : "translate_failed";
    if (message === "missing_api_key") {
      return { ok: false, error: "missing_api_key" };
    }
    return { ok: false, error: "translate_failed" };
  }
}
