import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { courses, formatPrice, getCourseBySlug } from "@/lib/courses";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return { title: "Курс не найден" };
  }

  return {
    title: course.title,
    description: course.summary,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Link
        href="/courses"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Назад к каталогу
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{course.format}</Badge>
            <Badge variant="outline">{course.level}</Badge>
            {course.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {course.title}
          </h1>

          <p className="text-lg text-muted-foreground">{course.summary}</p>

          <div className="prose prose-neutral max-w-none text-foreground">
            <p>{course.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-foreground/10 pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Автор</dt>
              <dd className="font-medium">{course.author}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Уроков</dt>
              <dd className="font-medium">{course.lessons}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Длительность</dt>
              <dd className="font-medium">{course.durationHours} ч</dd>
            </div>
          </dl>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                {formatPrice(course.priceRub)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Доступ к материалам сразу после оплаты. Учитесь в своём темпе.
            </CardContent>
            <CardFooter>
              <Button className="w-full" render={<Link href="/login" />}>
                Записаться на курс
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}
