"use client";

import { Download, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { generateGoogleAdsPack } from "@/app/[locale]/studio/courses/[courseId]/ads-pack/actions";
import { packToMarkdown } from "@/lib/ads-pack/serialize";
import type { AdsPackLocale, GoogleAdsPack } from "@/lib/ads-pack/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  locale: string;
  courseId: string;
  courseTitle: string;
  initialPack: GoogleAdsPack;
};

function CopyBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  async function copyAll() {
    await navigator.clipboard.writeText(items.join("\n"));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={copyAll}>
          Copy
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item} className="rounded-md bg-muted/40 px-2 py-1 font-mono text-xs">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function GoogleAdsPackPanel({
  locale,
  courseId,
  courseTitle,
  initialPack,
}: Props) {
  const t = useTranslations("Studio.adsPack");
  const [pack, setPack] = useState<GoogleAdsPack>(initialPack);
  const [contentLocale, setContentLocale] = useState<AdsPackLocale>(initialPack.primaryLocale);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markdown = useMemo(() => packToMarkdown(pack), [pack]);

  async function runGenerate(useAi: boolean) {
    setPending(true);
    setError(null);

    const result = await generateGoogleAdsPack({
      locale,
      courseId,
      contentLocale,
      useAi,
    });

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPack(result.pack);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `google-ads-${pack.courseSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `google-ads-${pack.courseSlug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("controlsTitle")}</CardTitle>
          <CardDescription>{t("controlsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">{t("contentLocale")}</span>
            <select
              value={contentLocale}
              onChange={(e) => setContentLocale(e.target.value as AdsPackLocale)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ru">RU</option>
              <option value="uk">UK</option>
              <option value="en">EN</option>
            </select>
          </label>

          <Button type="button" variant="outline" disabled={pending} onClick={() => runGenerate(false)}>
            {t("refreshBase")}
          </Button>
          <Button type="button" disabled={pending} onClick={() => runGenerate(true)}>
            <Sparkles className="size-4" />
            {pending ? t("generating") : t("generateAi")}
          </Button>
          <Button type="button" variant="outline" onClick={downloadJson}>
            <Download className="size-4" />
            JSON
          </Button>
          <Button type="button" variant="outline" onClick={downloadMarkdown}>
            <Download className="size-4" />
            Markdown
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t(`errors.${error}` as "errors.not_found")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{courseTitle}</CardTitle>
          <CardDescription>
            {pack.aiGenerated ? t("aiReady") : t("baseReady")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {pack.links.map((link) => (
            <div key={link.locale} className="space-y-1">
              <p className="font-medium">{link.label}</p>
              <p className="break-all font-mono text-xs text-muted-foreground">{link.urlWithUtm}</p>
            </div>
          ))}
          {pack.pricing.currentPriceEur && (
            <p>
              {t("price")}: {pack.pricing.currentPriceEur}
              {pack.pricing.discountPercent
                ? ` (${t("was")} ${pack.pricing.originalPriceEur}, −${pack.pricing.discountPercent}%)`
                : null}
            </p>
          )}
          {pack.media.coverUrl && (
            <p>
              {t("cover")}:{" "}
              <a href={pack.media.coverUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                {pack.media.coverUrl}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      <CopyBlock label={t("headlines")} items={pack.copy.headlines} />
      <CopyBlock label={t("longHeadlines")} items={pack.copy.longHeadlines} />
      <CopyBlock label={t("descriptions")} items={pack.copy.descriptions} />
      <CopyBlock label={t("keywords")} items={pack.copy.keywords} />
      <CopyBlock label={t("callouts")} items={pack.copy.callouts} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("checklist")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {pack.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
