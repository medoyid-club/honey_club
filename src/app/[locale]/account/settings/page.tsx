import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { UserAvatar } from "@/components/account/user-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserProfile, requireUser } from "@/lib/account";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account" });
  return { title: t("settingsTitle") };
}

export default async function AccountSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireUser(locale);
  if (!user) return null;

  const profile = await getUserProfile(user.id, user.email);
  const t = await getTranslations("Account");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("settingsTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("settingsSubtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("profileSection")}</CardTitle>
          <CardDescription>{t("profileSectionDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <UserAvatar profile={profile} size="lg" />
            <p className="text-sm text-muted-foreground">{t("avatarHint")}</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">{t("fieldEmail")}</dt>
              <dd className="text-sm font-medium">{profile.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">{t("fieldName")}</dt>
              <dd className="text-sm font-medium">{profile.fullName ?? "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">{t("fieldUsername")}</dt>
              <dd className="text-sm font-medium">{profile.username ?? "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">{t("fieldLocale")}</dt>
              <dd className="text-sm font-medium">{profile.locale}</dd>
            </div>
          </dl>

          <p className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {t("settingsComingSoon")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
