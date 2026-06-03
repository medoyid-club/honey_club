"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function UserNav() {
  const t = useTranslations("Nav");
  const tLogin = useTranslations("Login");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loggedIn === null) {
    // Loading state — empty placeholder to avoid layout shift
    return <div className="hidden h-8 w-20 animate-pulse rounded-md bg-muted sm:block" />;
  }

  if (loggedIn) {
    return (
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="sm" className="hidden sm:inline-flex">
          {tLogin("logout")}
        </Button>
      </form>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="hidden sm:inline-flex"
      render={<Link href="/login" />}
    >
      {t("login")}
    </Button>
  );
}
