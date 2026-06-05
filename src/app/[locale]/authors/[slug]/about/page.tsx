import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/markdown";
import type { Locale } from "@/i18n/routing";
import { getPublishedAuthorPageBySlug, pick } from "@/lib/authors/db";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function AuthorAboutPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) notFound();

  const t = await getTranslations("Author.about");
  const bio = pick(activeLocale, page.bio_ru, page.bio_uk, page.bio_en);
  const contacts = (page.contacts ?? {}) as Record<string, string>;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="space-y-4 rounded-xl border border-foreground/10 bg-card p-6">
        {bio ? (
          <Markdown>{bio}</Markdown>
        ) : (
          <p className="text-sm text-muted-foreground">{t("moreSoon")}</p>
        )}
        {(contacts.email || contacts.location) && (
          <dl className="grid gap-2 border-t border-foreground/10 pt-4 text-sm">
            {contacts.email && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{contacts.email}</dd>
              </div>
            )}
            {contacts.location && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{t("location")}:</dt>
                <dd>{contacts.location}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
