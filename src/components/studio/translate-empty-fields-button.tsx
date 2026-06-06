"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { translateEmptyFormFields } from "@/app/[locale]/studio/translate/actions";
import { Button } from "@/components/ui/button";

type Props = {
  formId: string;
  fieldBases: string[];
  locale: string;
  className?: string;
};

const CONTENT_LOCALES = ["ru", "uk", "en"] as const;

function readFormFieldValue(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!el) return "";
  if (el instanceof RadioNodeList) {
    const input = el.value;
    return typeof input === "string" ? input : "";
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.value;
  }
  return "";
}

function writeFormFieldValue(form: HTMLFormElement, name: string, value: string) {
  const el = form.elements.namedItem(name);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }
  return false;
}

export function TranslateEmptyFieldsButton({
  formId,
  fieldBases,
  locale,
  className,
}: Props) {
  const t = useTranslations("Studio.translate");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    setPending(true);
    setMessage(null);
    setError(null);

    const fields: Record<string, string> = {};
    for (const base of fieldBases) {
      for (const loc of CONTENT_LOCALES) {
        const name = `${base}_${loc}`;
        fields[name] = readFormFieldValue(form, name);
      }
    }

    const result = await translateEmptyFormFields({ locale, fieldBases, fields });
    setPending(false);

    if (!result.ok) {
      setError(t(`errors.${result.error}` as "errors.missing_api_key"));
      return;
    }

    let count = 0;
    for (const [name, value] of Object.entries(result.updates)) {
      if (writeFormFieldValue(form, name, value)) count++;
    }

    if (count === 0) {
      setMessage(t("nothingToFill"));
    } else {
      setMessage(t("filled", { count }));
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleClick}
        className="gap-1.5"
      >
        <Languages className="size-3.5" />
        {pending ? t("translating") : t("translateEmpty")}
      </Button>
      {message && <p className="mt-1.5 text-xs text-muted-foreground">{message}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
