import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CourseCardsDemo } from "../course-cards-demo";
import { DemoSection } from "../demo-section";

export function CardsSection() {
  return (
    <DemoSection
      id="cards"
      title="Карточки"
      description="Базовая Card из shadcn и реальная CourseCard с mock-данными. Экспериментируйте с обложками, hover и прогрессом."
    >
      <div className="space-y-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Базовая карточка</CardTitle>
              <CardDescription>
                CardHeader, CardContent, CardFooter — стандартная структура.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Контент карточки. Можно добавить изображение первым child для скругления сверху.
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" size="sm">
                Отмена
              </Button>
              <Button size="sm">Сохранить</Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
            <div className="h-32 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
            <CardHeader>
              <div className="flex gap-2">
                <Badge variant="secondary">Курс</Badge>
                <Badge variant="outline">С обложкой</Badge>
              </div>
              <CardTitle className="text-lg">Эксперимент с gradient cover</CardTitle>
              <CardDescription>
                Если нет cover_url — можно использовать мёдовый градиент как placeholder.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
              <span className="font-heading font-semibold text-primary">€49</span>
              <Button size="sm">Подробнее</Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            CourseCard (production component)
          </p>
          <CourseCardsDemo />
        </div>
      </div>
    </DemoSection>
  );
}
