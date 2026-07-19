import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  toggleAuthorPagePublished,
  updateAuthorProfile,
} from "@/app/[locale]/studio/profile/actions";
import { TranslateEmptyFieldsButton } from "@/components/studio/translate-empty-fields-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudioContext } from "@/lib/studio";
import type { SocialEntry } from "@/lib/authors/db";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function StudioProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { saved, error } = await searchParams;

  const { page } = await getStudioContext(locale);
  const t = await getTranslations("Studio.profileForm");

  const socials = (Array.isArray(page.socials) ? page.socials : []) as SocialEntry[];
  const socialUrl = (platform: string) =>
    socials.find((s) => s.platform === platform)?.url ?? "";
  const contacts = (page.contacts ?? {}) as Record<string, string>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <form action={toggleAuthorPagePublished}>
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant={page.published ? "outline" : "default"}>
            {page.published ? t("unpublish") : t("publish")}
          </Button>
        </form>
      </header>

      {saved && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {t("saved")}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error === "upload" ? t("uploadError") : t("saveError")}
        </div>
      )}

      <form
        id="studio-profile-form"
        action={updateAuthorProfile}
        className="space-y-6"
        encType="multipart/form-data"
      >
        <input type="hidden" name="locale" value={locale} />

        <Card>
          <CardHeader>
            <CardTitle>{t("basics")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField name="display_name" label={t("displayName")} defaultValue={page.display_name} />
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">{t("slug")}</span>
              <input name="slug" defaultValue={page.slug} className={inputClass} />
            </label>
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
              <FileField name="cover" label={t("cover")} current={page.cover_url} />
              <FileField name="avatar" label={t("avatar")} current={page.avatar_url} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <TranslateEmptyFieldsButton
            formId="studio-profile-form"
            fieldBases={["headline", "slogan", "bio"]}
            locale={locale}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("headline")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <TextField name="headline_ru" label="RU" defaultValue={page.headline_ru} />
            <TextField name="headline_uk" label="UK" defaultValue={page.headline_uk} />
            <TextField name="headline_en" label="EN" defaultValue={page.headline_en} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("slogan")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <TextField name="slogan_ru" label="RU" defaultValue={page.slogan_ru} />
            <TextField name="slogan_uk" label="UK" defaultValue={page.slogan_uk} />
            <TextField name="slogan_en" label="EN" defaultValue={page.slogan_en} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("bio")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <AreaField name="bio_ru" label="RU" defaultValue={page.bio_ru} />
            <AreaField name="bio_uk" label="UK" defaultValue={page.bio_uk} />
            <AreaField name="bio_en" label="EN" defaultValue={page.bio_en} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("socials")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField name="social_youtube" label="YouTube" defaultValue={socialUrl("youtube")} />
            <TextField name="social_telegram" label="Telegram" defaultValue={socialUrl("telegram")} />
            <TextField name="social_facebook" label="Facebook" defaultValue={socialUrl("facebook")} />
            <TextField name="social_instagram" label="Instagram" defaultValue={socialUrl("instagram")} />
            <TextField name="social_email" label="Email (mailto:)" defaultValue={socialUrl("email")} />
            <TextField name="social_mono" label="Monobank" defaultValue={socialUrl("mono")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("contacts")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField name="contact_email" label={t("contactEmail")} defaultValue={contacts.email ?? null} />
            <TextField name="contact_location" label={t("contactLocation")} defaultValue={contacts.location ?? null} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">{t("save")}</Button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input name={name} defaultValue={defaultValue ?? ""} className={inputClass} />
    </label>
  );
}

function AreaField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={5}
        className={`${inputClass} resize-y`}
      />
    </label>
  );
}

function FileField({
  name,
  label,
  current,
}: {
  name: string;
  label: string;
  current: string | null;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {current ? (
        <div className="overflow-hidden rounded-md border border-foreground/10 bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="max-h-32 w-full object-cover" />
        </div>
      ) : null}
      <input
        type="file"
        name={name}
        accept="image/*"
        className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
      />
    </label>
  );
}
