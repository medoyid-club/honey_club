import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DemoRow, DemoSection } from "../demo-section";

const variants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const sizes = ["xs", "sm", "default", "lg"] as const;

export function ButtonsSection() {
  return (
    <DemoSection
      id="buttons"
      title="Кнопки"
      description="Все варианты и размеры. Primary + honey-glow — для главной CTA на экране."
    >
      <div className="space-y-8">
        <DemoRow label="Variants">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </DemoRow>

        <DemoRow label="Sizes (default variant)">
          {sizes.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
        </DemoRow>

        <DemoRow label="CTA patterns">
          <Button size="lg" className="honey-glow">
            Начать обучение
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/25 hover:bg-primary/5 hover:text-primary"
          >
            О проекте
          </Button>
          <Button size="sm" className="honey-glow-sm">
            Записаться
          </Button>
        </DemoRow>

        <DemoRow label="With icons">
          <Button>
            <Play data-icon="inline-start" />
            Продолжить урок
          </Button>
          <Button variant="secondary">
            Подробнее
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button disabled>Заблокировано</Button>
        </DemoRow>

        <DemoRow label="Full width (mobile CTA)">
          <Button className="w-full max-w-xs">Купить курс — €49</Button>
        </DemoRow>
      </div>
    </DemoSection>
  );
}
