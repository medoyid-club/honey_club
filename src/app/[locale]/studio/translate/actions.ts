"use server";

import { fillEmptyTranslations } from "@/lib/studio/fill-empty-translations";
import { getStudioContext } from "@/lib/studio";

export type TranslateEmptyFieldsInput = {
  locale: string;
  fieldBases: string[];
  fields: Record<string, string>;
};

export type TranslateEmptyFieldsResult =
  | { ok: true; updates: Record<string, string> }
  | { ok: false; error: string };

export async function translateEmptyFormFields(
  input: TranslateEmptyFieldsInput
): Promise<TranslateEmptyFieldsResult> {
  await getStudioContext(input.locale);

  if (!input.fieldBases.length) {
    return { ok: false, error: "nothing_to_fill" };
  }

  const result = await fillEmptyTranslations({
    fieldBases: input.fieldBases,
    fields: input.fields,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true, updates: result.updates };
}
