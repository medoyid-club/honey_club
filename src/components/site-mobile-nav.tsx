"use client";

import { Menu, ShoppingCart, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Props = {
  authSlot: ReactNode;
};

export function SiteMobileNav({ authSlot }: Props) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/courses", label: t("courses") },
    { href: "/#about", label: t("about") },
    { href: "/authors", label: t("authors") },
  ] as const;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="sm:hidden"
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("closeMenu")}
            onClick={() => setOpen(false)}
          />
          <aside
            id="site-mobile-nav"
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-border bg-background shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-heading text-sm font-semibold">{t("menu")}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("closeMenu")}
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex flex-col gap-1 p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ShoppingCart className="size-4" />
                {t("cart")}
              </Link>
            </nav>

            <div className="mt-auto space-y-4 border-t border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>

              <div onClick={() => setOpen(false)}>{authSlot}</div>

              <Button
                nativeButton={false}
                className="w-full honey-glow-sm"
                render={<Link href="/courses" onClick={() => setOpen(false)} />}
              >
                {t("start")}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
