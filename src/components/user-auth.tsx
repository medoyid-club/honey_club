import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function UserAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const tNav = await getTranslations("Nav");
  const tLogin = await getTranslations("Login");

  if (user) {
    return (
      <form action="/auth/signout" method="post">
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
        >
          {tLogin("logout")}
        </Button>
      </form>
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
