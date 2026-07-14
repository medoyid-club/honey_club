"use client";

import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/cosmos", key: "hub", exact: true },
  { href: "/admin/cosmos/roadmap", key: "roadmap", exact: false },
  { href: "/admin/cosmos/business-model", key: "businessModel", exact: false },
] as const;

export function AdminCosmosNav() {
  const t = useTranslations("Admin.cosmosNav");
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
      <nav className="flex flex-wrap items-center gap-1 text-sm">
        <Link
          href="/admin"
          className="mr-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {t("backToAdmin")}
        </Link>
        {NAV.map(({ href, key, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-2.5 py-1.5 transition-colors",
                active
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <LanguageSwitcher />
    </div>
  );
}
