"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };

type Props = {
  slug: string;
  categories: Category[];
  active: string;
};

export function AuthorVideoCategoryTabs({ slug, categories, active }: Props) {
  const t = useTranslations("Author.videos.categories");

  const items: Category[] = [{ slug: "all", name: t("all") }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((category) => {
        const href =
          category.slug === "all"
            ? `/authors/${slug}/videos`
            : `/authors/${slug}/videos?category=${category.slug}`;
        const isActive = active === category.slug;

        return (
          <Link
            key={category.slug}
            href={href}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              isActive
                ? "border-primary/40 bg-primary/10 font-medium text-primary"
                : "border-foreground/10 text-muted-foreground hover:border-primary/25 hover:text-foreground"
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
