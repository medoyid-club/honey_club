import { useLocale, useTranslations } from "next-intl";
import { Suspense } from "react";

import { CartLink } from "@/components/cart-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteLogo } from "@/components/site-logo";
import { SiteMobileNav } from "@/components/site-mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAuth, UserAuthFallback } from "@/components/user-auth";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const locale = useLocale();

  const navItems = [
    { href: "/courses", label: t("courses") },
    { href: "/#about", label: t("about") },
    { href: "/authors", label: t("authors") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <SiteLogo />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <Suspense
              fallback={
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted/40" />
              }
            >
              <CartLink locale={locale} />
            </Suspense>
            <LanguageSwitcher />
            <ThemeToggle />
            <Suspense fallback={<UserAuthFallback />}>
              <UserAuth />
            </Suspense>
            <Button
              nativeButton={false}
              size="sm"
              className="honey-glow-sm"
              render={<Link href="/courses" />}
            >
              {t("start")}
            </Button>
          </div>

          <SiteMobileNav
            authSlot={
              <Suspense
                fallback={
                  <div className="h-9 w-full animate-pulse rounded-md bg-muted/40" />
                }
              >
                <UserAuth variant="mobile" />
              </Suspense>
            }
          />
        </div>
      </div>
    </header>
  );
}
