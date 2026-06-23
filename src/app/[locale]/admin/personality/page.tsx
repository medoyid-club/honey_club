import { getTranslations, setRequestLocale } from "next-intl/server";

import { PersonalityPlayground } from "@/components/personality/personality-playground";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { HORIZON_IDS, PROFILE_LAYERS } from "@/lib/personality/layers";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPersonalityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("AdminPersonality");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm">
          <p className="font-medium">{t("variantATitle")}</p>
          <p className="mt-1 text-muted-foreground">{t("variantABody")}</p>
        </div>
      </header>

      <PersonalityPlayground />

      <hr className="border-foreground/10" />

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("formulaTitle")}</h2>
          <p className="mt-1 font-mono text-sm text-primary">{t("formula")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("formulaDesc")}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("layersTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("layersSubtitle")}</p>
        </div>

        <div className="space-y-3">
          {PROFILE_LAYERS.map((layer, index) => (
            <Card key={layer.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {index + 1}. {t(`profileLayers.${layer.id}.title`)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t(`profileLayers.${layer.id}.desc`)}
                    </CardDescription>
                  </div>
                  <span className="shrink-0 rounded-full border border-foreground/10 px-2 py-0.5 text-xs text-muted-foreground">
                    {t(`speed.${layer.speed}`)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t(`profileLayers.${layer.id}.example`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("principlesTitle")}</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <li
              key={n}
              className="rounded-lg border border-foreground/10 bg-card p-4 text-sm text-muted-foreground"
            >
              {t(`principles.${n}` as "principles.1")}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("horizonsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("horizonsSubtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {HORIZON_IDS.map((id) => (
            <Card key={id}>
              <CardHeader>
                <CardTitle className="text-base">{t(`horizons.${id}.title`)}</CardTitle>
                <CardDescription>{t(`horizons.${id}.subtitle`)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t(`horizons.${id}.body`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="font-heading text-lg font-semibold">{t("ctaTitle")}</h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("ctaBody")}</p>
        <Button nativeButton={false} className="mt-4" render={<Link href="/admin/honey-club" />}>
          {t("ctaButton")}
        </Button>
      </div>
    </div>
  );
}
