import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { StudioNav } from "@/components/studio/studio-nav";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { AuthorPageRow } from "@/lib/authors/db";

type Props = {
  page: AuthorPageRow;
};

export async function StudioSidebar({ page }: Props) {
  const t = await getTranslations("Studio");

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="sticky top-24 space-y-6 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
        <div className="space-y-2 border-b border-foreground/10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t("title")}
          </p>
          <p className="truncate text-sm font-medium">
            {page.headline_ru || page.slug}
          </p>
          <Badge variant={page.published ? "default" : "outline"}>
            {page.published ? t("statusPublished") : t("statusDraft")}
          </Badge>
        </div>

        <StudioNav />

        {page.published && (
          <Link
            href={`/authors/${page.slug}`}
            className="flex items-center gap-2 border-t border-foreground/10 px-3 pt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            {t("viewPublic")}
          </Link>
        )}
      </div>
    </aside>
  );
}
