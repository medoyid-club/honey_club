"use client";

import { Orbit, Shield, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", labelKey: "overview", icon: Users, exact: true },
  { href: "/admin/personality", labelKey: "personality", icon: Sparkles, exact: false },
  { href: "/admin/honey-club", labelKey: "honeyClub", icon: Shield, exact: false },
  { href: "/admin/cosmos", labelKey: "cosmos", icon: Orbit, exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const t = useTranslations("Admin.nav");

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, labelKey, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
