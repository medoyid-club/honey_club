import { getTranslations } from "next-intl/server";

import { BusinessModelCanvas } from "@/components/admin/cosmos/business-model-canvas";
import { Link } from "@/i18n/navigation";

export default async function BusinessModelPage() {
  const t = await getTranslations("Cosmos.bmcPage");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("description")}{" "}
          <Link href="/sandbox/cosmos/roadmap" className="text-primary hover:underline">
            {t("roadmapLink")}
          </Link>
          .
        </p>
      </header>
      <BusinessModelCanvas />
    </div>
  );
}
