import { getTranslations } from "next-intl/server";

import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";

export async function AdminSidebar() {
  const t = await getTranslations("Admin");

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="sticky top-24 space-y-6 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
        <div className="space-y-2 border-b border-foreground/10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t("title")}
          </p>
          <p className="text-sm text-muted-foreground">{t("sidebarHint")}</p>
          <Badge variant="outline">{t("internalBadge")}</Badge>
        </div>

        <AdminNav />
      </div>
    </aside>
  );
}
