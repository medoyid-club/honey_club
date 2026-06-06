import { cn } from "@/lib/utils";

import { DemoRow, DemoSection } from "../demo-section";

const navLinks = [
  { label: "Курсы", active: true },
  { label: "О нас", active: false },
  { label: "Авторы", active: false },
];

export function NavigationSection() {
  return (
    <DemoSection
      id="navigation"
      title="Навигация"
      description="Паттерны для header, sidebar и активных состояний. Сравните с SiteHeader на живом сайте."
    >
      <div className="space-y-8">
        <DemoRow label="Header links (как в SiteHeader)">
          <nav className="flex items-center gap-6 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            {navLinks.map((link) => (
              <span
                key={link.label}
                className={cn(
                  "cursor-default transition-colors",
                  link.active
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {link.label}
              </span>
            ))}
          </nav>
        </DemoRow>

        <DemoRow label="Sidebar active item">
          <div className="w-56 space-y-1 rounded-lg border border-border bg-sidebar p-2 text-sm">
            <div className="rounded-md border-l-2 border-primary bg-sidebar-accent px-3 py-2 font-medium text-sidebar-accent-foreground">
              Мои курсы
            </div>
            <div className="rounded-md px-3 py-2 text-muted-foreground hover:bg-sidebar-accent/50">
              Профиль
            </div>
            <div className="rounded-md px-3 py-2 text-muted-foreground hover:bg-sidebar-accent/50">
              Настройки
            </div>
          </div>
        </DemoRow>

        <DemoRow label="Filter chips">
          <div className="flex flex-wrap gap-2">
            {["Все", "Курсы", "Лекции", "Семинары"].map((label, i) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  i === 0
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/25 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </DemoRow>
      </div>
    </DemoSection>
  );
}
