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
  courseId: string,
  userEmail?: string | null
): Promise<CourseAccess> {
  const access: CourseAccess = { fullCourse: false, moduleIds: new Set() };
  if (!userId && !userEmail) return access;

  let query = supabase
    .from("enrollments")
    .select("scope, module_id, payment_status, user_id, is_gift, gift_recipient_email")
    .eq("course_id", courseId)
    .in("payment_status", ["free", "paid"]);

  if (userId && userEmail) {
    query = query.or(
      `user_id.eq.${userId},and(is_gift.eq.true,gift_recipient_email.ilike.${userEmail})`
    );
  } else if (userId) {
    query = query.eq("user_id", userId);
  } else if (userEmail) {
    query = query.eq("is_gift", true).ilike("gift_recipient_email", userEmail);
  }

  const { data } = await query;

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
