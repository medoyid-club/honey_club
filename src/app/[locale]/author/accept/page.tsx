import { getTranslations, setRequestLocale } from "next-intl/server";

import { acceptInvite } from "@/app/[locale]/author/accept/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getSessionUser } from "@/lib/auth/roles";
import { createServiceClient } from "@/lib/supabase/service";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function AcceptInvitePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token, error } = await searchParams;

  const t = await getTranslations("AuthorInvite");

  if (!token) {
    return <Notice title={t("invalidTitle")} text={t("invalidText")} />;
  }

  const user = await getSessionUser();
  if (!user) {
    return (
      <Notice
        title={t("loginTitle")}
        text={t("loginText")}
        action={
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/login?redirect=/${locale}/author/accept?token=${token}`}
              />
            }
          >
            {t("loginButton")}
          </Button>
        }
      />
    );
  }

  const svc = createServiceClient();
  const { data: invite } = await svc
    .from("author_invites")
    .select("email, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  const isExpired =
    !!invite && new Date(invite.expires_at).getTime() < Date.now();

  if (!invite || invite.status === "expired" || isExpired) {
    return <Notice title={t("invalidTitle")} text={t("expiredText")} />;
  }

  if (invite.status === "accepted") {
    return (
      <Notice
        title={t("acceptedTitle")}
        text={t("acceptedText")}
        action={
          <Button nativeButton={false} render={<Link href="/studio" />}>
            {t("toStudio")}
          </Button>
        }
      />
    );
  }

  const emailMatches =
    (user.email || "").toLowerCase() === (invite.email || "").toLowerCase();

  if (!emailMatches || error === "email_mismatch") {
    return (
      <Notice
        title={t("mismatchTitle")}
        text={t("mismatchText", { email: invite.email })}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("intro")}</p>
          <p>{t("benefits")}</p>
        </CardContent>
        <CardFooter>
          <form action={acceptInvite} className="w-full">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="w-full">
              {t("accept")}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

function Notice({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
        {action && <CardFooter>{action}</CardFooter>}
      </Card>
    </div>
  );
}
