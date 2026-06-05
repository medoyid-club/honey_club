import { getTranslations, setRequestLocale } from "next-intl/server";

import { inviteAuthor, revokeInvite, setUserRole } from "@/app/[locale]/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/service";
import { getBaseUrl } from "@/lib/url";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    invited?: string;
    sent?: string;
    token?: string;
    roleUpdated?: string;
    error?: string;
  }>;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: "user" | "author" | "admin";
};

type InviteRow = {
  id: string;
  email: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
};

export default async function AdminPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const t = await getTranslations("Admin");

  const svc = createServiceClient();
  const [{ data: profiles }, { data: usersData }, { data: invites }] =
    await Promise.all([
      svc
        .from("profiles")
        .select("id, full_name, username, role")
        .order("role", { ascending: true }),
      svc.auth.admin.listUsers(),
      svc
        .from("author_invites")
        .select("id, email, status, token, created_at, expires_at")
        .order("created_at", { ascending: false }),
    ]);

  const emailById = new Map<string, string>();
  for (const u of usersData?.users ?? []) {
    if (u.email) emailById.set(u.id, u.email);
  }

  const rows = (profiles as ProfileRow[] | null) ?? [];
  const inviteRows = (invites as InviteRow[] | null) ?? [];

  const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    author: "secondary",
    user: "outline",
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {sp.invited && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="font-medium">
            {sp.sent === "1" ? t("inviteSent", { email: sp.invited }) : t("inviteCreated", { email: sp.invited })}
          </p>
          {sp.token && (
            <p className="mt-2 break-all text-muted-foreground">
              {t("inviteLink")}:{" "}
              <code className="text-foreground">
                {getBaseUrl()}/{locale}/author/accept?token={sp.token}
              </code>
            </p>
          )}
        </div>
      )}

      {sp.roleUpdated && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {t("roleUpdated")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("inviteTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteAuthor} className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="locale" value={locale} />
            <input
              type="email"
              name="email"
              required
              placeholder={t("invitePlaceholder")}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit">{t("inviteButton")}</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">{t("inviteHint")}</p>
        </CardContent>
      </Card>

      {inviteRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("invitesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inviteRows.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-foreground/10 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium">{inv.email}</span>
                  <Badge variant="outline" className="ml-2">
                    {t(`inviteStatus.${inv.status}` as never)}
                  </Badge>
                </div>
                {inv.status === "pending" && (
                  <form action={revokeInvite}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="inviteId" value={inv.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {t("revoke")}
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("usersTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-foreground/10 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {p.full_name || p.username || emailById.get(p.id) || p.id}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {emailById.get(p.id) ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={roleVariant[p.role] ?? "outline"}>
                  {t(`roles.${p.role}` as never)}
                </Badge>
                <form action={setUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="userId" value={p.id} />
                  <select
                    name="role"
                    defaultValue={p.role}
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  >
                    <option value="user">{t("roles.user")}</option>
                    <option value="author">{t("roles.author")}</option>
                    <option value="admin">{t("roles.admin")}</option>
                  </select>
                  <Button type="submit" variant="outline" size="sm">
                    {t("apply")}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
