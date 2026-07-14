import { getTranslations, setRequestLocale } from "next-intl/server";

import { RoadmapGantt } from "@/components/admin/cosmos/roadmap-gantt";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCosmosRoadmapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cosmos.roadmapPage");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
      </header>
      <RoadmapGantt />
    </div>
  );
}
