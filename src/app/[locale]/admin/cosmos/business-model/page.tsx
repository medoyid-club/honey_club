import { getTranslations, setRequestLocale } from "next-intl/server";

import { BusinessModelCanvas } from "@/components/admin/cosmos/business-model-canvas";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCosmosBusinessModelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cosmos.bmcPage");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("description")}{" "}
          <Link href="/admin/cosmos/roadmap" className="text-primary hover:underline">
            {t("roadmapLink")}
          </Link>
          .
        </p>
      </header>
      <BusinessModelCanvas />
    </div>
  );
}
