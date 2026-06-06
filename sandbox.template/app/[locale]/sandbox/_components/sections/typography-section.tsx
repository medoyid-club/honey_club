import { DemoSection } from "../demo-section";

export function TypographySection() {
  return (
    <DemoSection
      id="typography"
      title="Типографика"
      description="Шкала заголовков и текста с активной парой шрифтов из переключателя выше. font-heading — заголовки, font-sans — body и UI."
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Hero / H1 · font-heading</p>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Школа развития и личностного роста
          </h1>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Section / H2</p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Популярные курсы
          </h2>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Card / H3</p>
          <h3 className="font-heading text-lg font-medium">
            Осознанность и внимание
          </h3>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Body · font-sans</p>
          <p className="max-w-2xl text-base">
            Платформа объединяет онлайн-курсы, лекции и семинары с будущей
            социальной RPG-средой — картой мира, квестами и совместимыми контактами.
            Абзац длиннее, чтобы оценить читаемость: межбуквенный ритм, высота строки
            и то, как шрифт ведёт себя на кириллице українською та російською.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Muted / meta</p>
          <p className="text-sm text-muted-foreground">
            Автор: Анна М. · 12 уроков · 8 часов · €49
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">font-heading · semibold</p>
            <p className="mt-2 font-heading text-xl font-semibold">Кнопка «Начать»</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">font-sans · medium</p>
            <p className="mt-2 text-sm font-medium">Навигация · Курсы · Авторы</p>
          </div>
        </div>
      </div>
    </DemoSection>
  );
}
