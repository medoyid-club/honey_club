"use client";

import { CourseCard } from "@/components/course-card";

import { mockCourses } from "./mock-data";

export function CourseCardsDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {mockCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
