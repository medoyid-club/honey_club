import Link from "next/link";

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
import { formatPrice, type Course } from "@/lib/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="h-full transition-shadow hover:ring-foreground/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{course.format}</Badge>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <CardTitle className="text-lg">
          <Link href={`/courses/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription>{course.summary}</CardDescription>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        <p>Автор: {course.author}</p>
        <p>
          {course.lessons} уроков · {course.durationHours} ч
        </p>
      </CardContent>

      <CardFooter className="justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          {formatPrice(course.priceRub)}
        </span>
        <Button size="sm" render={<Link href={`/courses/${course.slug}`} />}>
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  );
}
