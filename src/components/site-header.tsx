import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAuth, UserAuthFallback } from "@/components/user-auth";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("Nav");

  const navItems = [
    { href: "/courses", label: t("courses") },
    { href: "/#about", label: t("about") },
    { href: "/#authors", label: t("authors") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <span aria-hidden className="text-xl">🍯</span>
          Honey&nbsp;Club
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Suspense fallback={<UserAuthFallback />}>
            <UserAuth />
          </Suspense>
          <Button nativeButton={false} size="sm" render={<Link href="/courses" />}>
            {t("start")}
          </Button>
        </div>
      </div>
    </header>
  );
}
