import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/courses", label: "Курсы" },
  { href: "/#about", label: "О проекте" },
  { href: "/#authors", label: "Авторы" },
];

export function SiteHeader() {
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
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Войти
          </Button>
          <Button size="sm" render={<Link href="/courses" />}>
            Начать учиться
          </Button>
        </div>
      </div>
    </header>
  );
}
