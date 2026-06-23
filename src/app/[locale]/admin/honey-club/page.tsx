import { getTranslations, setRequestLocale } from "next-intl/server";

import { HoneyClubLab } from "@/components/personality/honey-club-lab";
import {
  LIVE_PIPELINE_LAYERS,
  PARTICLE_LAYERS,
  PIPELINE_LAYER_IDS,
} from "@/lib/personality/layers";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminHoneyClubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("AdminHoneyClub");

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

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("architectureTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("architectureSubtitle")}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("tableParticle")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableRole")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableChange")}</th>
                </tr>
              </thead>
              <tbody>
                {PARTICLE_LAYERS.map((id) => (
                  <tr key={id} className="border-t border-foreground/10">
                    <td className="px-4 py-3 font-medium">{t(`particles.${id}.name`)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t(`particles.${id}.role`)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t(`particles.${id}.change`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-foreground/10 bg-card p-4">
            <h3 className="text-sm font-semibold">{t("pipelineTitle")}</h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {PIPELINE_LAYER_IDS.map((id, index) => {
                const live = LIVE_PIPELINE_LAYERS.includes(id);
                return (
                  <span key={id} className="flex items-center gap-2">
                    <span
                      className={
                        live
                          ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          : "rounded-full border border-foreground/10 px-3 py-1 text-xs text-muted-foreground"
                      }
                    >
                      {index + 1}. {t(`pipeline.${id}`)}
                    </span>
                    {index < PIPELINE_LAYER_IDS.length - 1 ? (
                      <span className="text-muted-foreground">→</span>
                    ) : null}
                  </span>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t("pipelineHint")}</p>
          </div>
        </div>
      </section>

      <HoneyClubLab />
    </div>
  );
}
