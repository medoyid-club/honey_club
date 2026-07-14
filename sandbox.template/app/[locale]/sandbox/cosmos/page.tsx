import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { CosmosPlayground } from "./_components/cosmos-playground";

export default async function CosmosSandboxPage() {
  const t = await getTranslations("Cosmos.prototypePage");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <Link
        href="/sandbox/cosmos/roadmap"
        className="block rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm transition-colors hover:bg-primary/10"
      >
        <span className="font-medium">{t("roadmapLink")} →</span>{" "}
        <span className="text-muted-foreground">{t("roadmapHint")}</span>
      </Link>

      <Link
        href="/sandbox/cosmos/business-model"
        className="block rounded-xl border border-border/60 bg-card/30 p-4 text-sm transition-colors hover:bg-card/50"
      >
        <span className="font-medium">{t("bmcLink")} →</span>{" "}
        <span className="text-muted-foreground">{t("bmcHint")}</span>
      </Link>

      <CosmosPlayground />
    </div>
  );
}
