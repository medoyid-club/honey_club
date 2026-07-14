"use client";

import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/sandbox/cosmos", key: "prototype" },
  { href: "/sandbox/cosmos/roadmap", key: "roadmap" },
  { href: "/sandbox/cosmos/business-model", key: "businessModel" },
] as const;

export function CosmosNav() {
  const t = useTranslations("Cosmos.nav");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link href="/sandbox" className="mr-2 text-xs text-muted-foreground hover:text-foreground">
            {t("sandbox")}
          </Link>
          {NAV.map(({ href, key }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
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
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
