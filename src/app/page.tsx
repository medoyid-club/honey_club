import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { courses } from "@/lib/courses";

const features = [
  {
    title: "Курсы и лекции",
    description:
      "Структурированные программы от практиков: от основ самопознания до лидерства.",
  },
  {
    title: "Профиль персонажа",
    description:
      "Проходите обучение и развивайте профиль «Я» — ваши сильные стороны и цели.",
  },
  {
    title: "Социальная среда",
    description:
      "Скоро: карта мира, квесты и совместимые контакты по интересам и целям.",
  },
];

export default function Home() {
  const featuredCourses = courses.slice(0, 3);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge variant="secondary">Обучение + игра</Badge>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Учитесь, развивайтесь и находите своих в Honey&nbsp;Club
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Онлайн-курсы, лекции и семинары для развития личности. На следующем
            этапе — социальная RPG-среда с картой мира, квестами и матчингом по
            интересам и типу личности.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/courses" />}>
              Смотреть курсы
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/#about" />}>
              О проекте
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-foreground/10 bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-2">
              <h2 className="font-heading text-xl font-medium">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Популярные курсы
            </h2>
            <p className="text-sm text-muted-foreground">
              Начните с того, что откликается именно вам.
            </p>
          </div>
          <Button variant="ghost" render={<Link href="/courses" />}>
            Все курсы →
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
