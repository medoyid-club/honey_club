"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/app/[locale]/login/actions";

type Props = {
  defaultTab?: string;
  error?: string;
};

export function AuthForm({ defaultTab = "login", error }: Props) {
  const t = useTranslations("Login");
  const locale = useLocale();
  const [tab, setTab] = useState<"login" | "register">(
    defaultTab === "register" ? "register" : "login"
  );

  return (
    <div className="space-y-4">
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
