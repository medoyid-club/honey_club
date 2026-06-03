import type { Metadata } from "next";

import { CourseCard } from "@/components/course-card";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Курсы",
  description:
    "Каталог курсов, лекций и семинаров Honey Club для развития личности.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <header className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Каталог курсов
        </h1>
        <p className="text-muted-foreground">
          Курсы, лекции и семинары — выбирайте формат и уровень под себя.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </div>
  );
}
