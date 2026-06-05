import type { SupabaseClient } from "@supabase/supabase-js";

export type CourseAccess = {
  fullCourse: boolean;
  moduleIds: Set<string>;
};

/**
 * Returns the access a user has to a course: whether they own the whole course
 * and which individual modules they've purchased.
 */
export async function getCourseAccess(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  courseId: string
): Promise<CourseAccess> {
  const access: CourseAccess = { fullCourse: false, moduleIds: new Set() };
  if (!userId) return access;

  const { data } = await supabase
    .from("enrollments")
    .select("scope, module_id, payment_status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("payment_status", ["free", "paid"]);

  for (const row of data ?? []) {
    if (row.scope === "module" && row.module_id) {
      access.moduleIds.add(row.module_id as string);
    } else {
      access.fullCourse = true;
    }
  }

  return access;
}

export function hasModuleAccess(access: CourseAccess, moduleId: string): boolean {
  return access.fullCourse || access.moduleIds.has(moduleId);
}
