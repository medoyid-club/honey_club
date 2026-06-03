import { getTranslations } from "next-intl/server";

import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { displayName, getUserProfile } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export async function UserAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const tNav = await getTranslations("Nav");

  if (user) {
    const profile = await getUserProfile(
      user.sub as string,
      (user.email as string | undefined) ?? ""
    );

    return (
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        className="hidden gap-2 sm:inline-flex"
        render={<Link href="/account" />}
      >
        <UserAvatar profile={profile} size="sm" />
        <span className="max-w-24 truncate">{displayName(profile)}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      className="hidden sm:inline-flex"
      render={<Link href="/login" />}
    >
      {tNav("login")}
    </Button>
  );
}

export function UserAuthFallback() {
  return <div className="hidden h-7 w-16 rounded-md bg-muted/40 sm:block" />;
}
