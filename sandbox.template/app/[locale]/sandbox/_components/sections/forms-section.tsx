import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DemoSection } from "../demo-section";

export function FormsSection() {
  return (
    <DemoSection
      id="forms"
      title="Формы"
      description="Input, Label и типичные состояния. Добавляйте сюда Select, Checkbox, Textarea по мере установки из shadcn."
    >
      <div className="grid max-w-md gap-6">
        <div className="space-y-2">
          <Label htmlFor="sandbox-email">Email</Label>
          <Input id="sandbox-email" type="email" placeholder="you@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sandbox-name">Имя</Label>
          <Input id="sandbox-name" defaultValue="Михаил" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sandbox-disabled">Disabled</Label>
          <Input id="sandbox-disabled" disabled placeholder="Недоступно" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sandbox-invalid">Invalid</Label>
          <Input id="sandbox-invalid" aria-invalid defaultValue="bad@" />
          <p className="text-xs text-destructive">Некорректный email</p>
        </div>

        <Button type="button" className="w-full">
          Войти
        </Button>
      </div>
    </DemoSection>
  );
}
