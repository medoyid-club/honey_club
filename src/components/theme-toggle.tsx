"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const order = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function cycleTheme() {
    const current = (theme as (typeof order)[number]) ?? "system";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={t("toggle")}
      title={t("toggle")}
    >
      {!mounted ? (
        <Sun />
      ) : theme === "dark" ? (
        <Moon />
      ) : theme === "system" ? (
        <Monitor />
      ) : (
        <Sun />
      )}
    </Button>
  );
}
