import { getTranslations } from "next-intl/server";

import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { displayName, getUserProfile } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export async function UserAuth({ variant = "header" }: { variant?: "header" | "mobile" }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const tNav = await getTranslations("Nav");
  const mobile = variant === "mobile";

  if (user) {
    const profile = await getUserProfile(
      user.sub as string,
      (user.email as string | undefined) ?? ""
    );

    const isCreator = profile.role === "author" || profile.role === "admin";

    if (mobile) {
      return (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            className="w-full justify-start gap-2"
            render={<Link href="/account" />}
          >
            <UserAvatar profile={profile} size="sm" />
            <span className="truncate">{displayName(profile)}</span>
          </Button>
          {isCreator && (
            <Button
              variant="ghost"
              nativeButton={false}
              className="w-full justify-start"
              render={<Link href="/studio" />}
            >
              {tNav("studio")}
            </Button>
          )}
          {profile.role === "admin" && (
            <Button
              variant="ghost"
              nativeButton={false}
              className="w-full justify-start"
              render={<Link href="/admin" />}
            >
              {tNav("admin")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {profile.role === "admin" && (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="hidden sm:inline-flex"
            render={<Link href="/admin" />}
          >
            {tNav("admin")}
          </Button>
        )}
        {isCreator && (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="hidden sm:inline-flex"
            render={<Link href="/studio" />}
          >
            {tNav("studio")}
          </Button>
        )}
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
      </div>
    );
  }

  return (
    <Button
      variant={mobile ? "outline" : "ghost"}
      size="sm"
      nativeButton={false}
      className={mobile ? "w-full" : "hidden sm:inline-flex"}
      render={<Link href="/login" />}
    >
      {tNav("login")}
    </Button>
  );
}

export function UserAuthFallback() {
  return <div className="hidden h-7 w-16 rounded-md bg-muted/40 sm:block" />;
}
