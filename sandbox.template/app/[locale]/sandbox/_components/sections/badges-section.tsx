import { Badge } from "@/components/ui/badge";

import { DemoRow, DemoSection } from "../demo-section";

const variants = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "ghost",
  "link",
] as const;

export function BadgesSection() {
  return (
    <DemoSection
      id="badges"
      title="Бейджи"
      description="Формат курса, уровень, статус. Secondary + outline — для метаданных карточки."
    >
      <div className="space-y-8">
        <DemoRow label="Variants">
          {variants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </DemoRow>

        <DemoRow label="Course metadata">
          <Badge variant="secondary">Курс</Badge>
          <Badge variant="outline">Начальный</Badge>
          <Badge className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/15">
            Скоро
          </Badge>
          <Badge variant="outline" className="border-green-500/30 text-green-700 dark:text-green-400">
            Бесплатно
          </Badge>
        </DemoRow>
      </div>
    </DemoSection>
  );
}
