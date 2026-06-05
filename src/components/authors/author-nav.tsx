"use client";

import { useTranslations } from "next-intl";

import { authorNavIcons } from "@/components/authors/author-nav-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
};

const navItems = [
  { segment: "", labelKey: "blog", icon: authorNavIcons.blog, exact: true },
  { segment: "courses", labelKey: "courses", icon: authorNavIcons.courses, exact: false },
  { segment: "videos", labelKey: "videos", icon: authorNavIcons.videos, exact: false },
  { segment: "about", labelKey: "about", icon: authorNavIcons.about, exact: false },
] as const;

export function AuthorNav({ slug }: Props) {
  const pathname = usePathname();
  const t = useTranslations("Author.nav");
  const base = `/authors/${slug}`;

  return (
    <nav
      aria-label={t("label")}
      className="flex gap-1 overflow-x-auto rounded-xl border border-foreground/10 bg-muted/30 p-1 lg:flex-col lg:overflow-visible"
    >
      {navItems.map(({ segment, labelKey, icon: Icon, exact }) => {
        const href = segment ? `${base}/${segment}` : base;
        const active = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={segment || "blog"}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
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
