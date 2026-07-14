import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCosmosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.cosmosHub");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cosmos/roadmap"
          className="block rounded-xl border border-primary/25 bg-primary/5 p-5 text-sm transition-colors hover:bg-primary/10"
        >
          <span className="font-medium">{t("roadmapTitle")} →</span>
          <p className="mt-2 text-muted-foreground">{t("roadmapHint")}</p>
        </Link>
        <Link
          href="/admin/cosmos/business-model"
          className="block rounded-xl border border-border/60 bg-card/40 p-5 text-sm transition-colors hover:bg-card/50"
        >
          <span className="font-medium">{t("bmcTitle")} →</span>
          <p className="mt-2 text-muted-foreground">{t("bmcHint")}</p>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">{t("storageNote")}</p>
    </div>
  );
}
