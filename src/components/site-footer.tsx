import Link from "next/link";

const columns = [
  {
    title: "Платформа",
    links: [
      { href: "/courses", label: "Курсы" },
      { href: "/#about", label: "О проекте" },
      { href: "/#authors", label: "Авторы" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contacts", label: "Контакты" },
    ],
  },
  {
    title: "Правовое",
    links: [
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Пользовательское соглашение" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <span aria-hidden className="text-xl">🍯</span>
            Honey&nbsp;Club
          </Link>
          <p className="text-sm text-muted-foreground">
            Обучающая платформа и социальная среда для развития личности.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h3 className="font-heading text-sm font-medium">{column.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-foreground/10 py-6">
        <p className="mx-auto w-full max-w-6xl px-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Honey Club. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
