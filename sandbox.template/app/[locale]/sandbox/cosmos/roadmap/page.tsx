import { getTranslations } from "next-intl/server";

import { RoadmapGantt } from "@/components/admin/cosmos/roadmap-gantt";

export default async function CosmosRoadmapPage() {
  const t = await getTranslations("Cosmos.roadmapPage");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
      </header>
      <RoadmapGantt />
    </div>
  );
}
