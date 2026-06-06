import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { DemoSection } from "../demo-section";

export function EffectsSection() {
  return (
    <DemoSection
      id="effects"
      title="Эффекты и утилиты"
      description="Классы из globals.css: honey-glow, honey-hero-bg, progress-honey."
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            honey-glow
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="honey-glow">honey-glow</Button>
            <Button size="sm" className="honey-glow-sm">
              honey-glow-sm
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            honey-hero-bg
          </p>
          <div className="honey-hero-bg rounded-xl border border-border/60 px-8 py-12 text-center">
            <Badge className="border-primary/30 bg-primary/10 text-primary">
              Hero section
            </Badge>
            <h3 className="mt-4 font-heading text-2xl font-semibold">
              Радиальный мёдовый градиент
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Класс .honey-hero-bg — для главного экрана и landing-блоков.
            </p>
          </div>
        </div>

        <div className="max-w-md space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            progress-honey
          </p>
          <div className="progress-honey">
            <span style={{ width: "62%" }} />
          </div>
          <p className="text-sm text-muted-foreground">62% курса пройдено</p>
        </div>
      </div>
    </DemoSection>
  );
}
