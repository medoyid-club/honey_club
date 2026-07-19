import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthorImage } from "@/components/authors/author-image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPublishedAuthorPages, pick } from "@/lib/authors/db";
import { authorCardImageSrc } from "@/lib/authors/media";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Authors" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function AuthorsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;
  const t = await getTranslations("Authors");
  const pages = await getPublishedAuthorPages();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <header className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => {
          const name = page.display_name || page.slug;
          const role = pick(
            activeLocale,
            page.headline_ru,
            page.headline_uk,
            page.headline_en
          );
          const photo = authorCardImageSrc(page);

          return (
            <Link
              key={page.slug}
              href={`/authors/${page.slug}`}
              className="group overflow-hidden rounded-xl border border-foreground/10 bg-card transition-colors hover:border-primary/25 hover:bg-primary/[0.03]"
            >
              <div className="relative aspect-[4/3] bg-muted/40">
                <AuthorImage
                  src={photo}
                  alt={name}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="transition-transform group-hover:scale-[1.02]"
                />
              </div>
              <div className="space-y-1 p-4">
                <h2 className="font-heading text-lg font-medium group-hover:text-primary">
                  {name}
                </h2>
                {role && <p className="text-sm text-muted-foreground">{role}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
