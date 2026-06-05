import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AccountNav } from "@/components/account/account-nav";
import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { displayHandle, displayName, type UserProfile } from "@/lib/account";

type Props = {
  profile: UserProfile;
  locale: string;
};

export async function AccountSidebar({ profile, locale }: Props) {
  const t = await getTranslations("Account");

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="sticky top-24 space-y-6 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
          <UserAvatar profile={profile} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-medium">{displayName(profile)}</p>
            <p className="truncate text-xs text-muted-foreground">{displayHandle(profile)}</p>
          </div>
        </div>

        <AccountNav />

        <form action={signOut} className="border-t border-foreground/10 pt-2">
          <input type="hidden" name="locale" value={locale} />
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            {t("logout")}
          </Button>
        </form>
      </div>
    </aside>
  );
}
