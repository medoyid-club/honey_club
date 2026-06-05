"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/app/[locale]/login/actions";
import { createClient } from "@/lib/supabase/client";

type Props = {
  defaultTab?: string;
  error?: string;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function AuthForm({ defaultTab = "login", error }: Props) {
  const t = useTranslations("Login");
  const locale = useLocale();
  const [tab, setTab] = useState<"login" | "register">(
    defaultTab === "register" ? "register" : "login"
  );
  const [googleLoading, setGoogleLoading] = useState(false);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}`,
      },
    });
    if (oauthError) {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={signInWithGoogle}
        disabled={googleLoading}
      >
        <GoogleIcon />
        {t("googleBtn")}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-foreground/10" />
        {t("orDivider")}
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <div className="flex rounded-lg border border-foreground/10 bg-muted p-1 text-sm">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-md px-4 py-1.5 transition-colors ${
            tab === "login"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("loginTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex-1 rounded-md px-4 py-1.5 transition-colors ${
            tab === "register"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("registerTab")}
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form action={tab === "login" ? login : signup} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full">
          {tab === "login" ? t("loginBtn") : t("registerBtn")}
        </Button>
      </form>
    </div>
  );
}
