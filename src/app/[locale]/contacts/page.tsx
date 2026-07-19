import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactEmailCard } from "@/components/contact-email-card";
import {
  AUTHOR_EMAILS,
  AUTHOR_EMAIL_ADDRESSES,
  CLUB_SERVICE_EMAIL_ROLES,
  EMAIL_ADDRESSES,
  type ClubServiceEmailRole,
} from "@/lib/email/addresses";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contacts" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contacts");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <header className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-medium tracking-tight">{t("clubSection")}</h2>
            <p className="text-sm text-muted-foreground">{t("clubSectionHint")}</p>
          </div>
          <div className="grid gap-4">
            {CLUB_SERVICE_EMAIL_ROLES.map((role: ClubServiceEmailRole) => (
              <ContactEmailCard
                key={role}
                title={t(`services.${role}.title`)}
                description={t(`services.${role}.description`)}
                email={EMAIL_ADDRESSES[role]}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-medium tracking-tight">{t("authorsSection")}</h2>
            <p className="text-sm text-muted-foreground">{t("authorsSectionHint")}</p>
          </div>
          <div className="grid gap-4">
            {AUTHOR_EMAILS.map((author) => (
              <ContactEmailCard
                key={author.key}
                title={author.displayName}
                description={t(`authors.${author.key}.description`)}
                email={AUTHOR_EMAIL_ADDRESSES[author.key]}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
