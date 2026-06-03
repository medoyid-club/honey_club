"use client";

import { BookOpen, LayoutDashboard, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", labelKey: "overview", icon: LayoutDashboard, exact: true },
  { href: "/account/courses", labelKey: "myCourses", icon: BookOpen, exact: false },
  { href: "/account/settings", labelKey: "settings", icon: Settings, exact: false },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  const t = useTranslations("Account.nav");

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
