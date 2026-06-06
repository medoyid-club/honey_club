import type { Locale } from "@/i18n/routing";
import { mapCourse, type Course, type DbCourseRow } from "@/lib/courses";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "user" | "author" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  locale: string;
  role: UserRole;
};

export type EnrolledCourse = Course & {
  enrolledAt: string;
  paymentStatus: "free" | "paid" | "pending" | "failed";
};

export async function requireUser(locale: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  if (!claims?.sub) {
    return { supabase, user: null as null };
  }

  return {
    supabase,
    user: {
      id: claims.sub as string,
      email: (claims.email as string | undefined) ?? "",
    },
  };
}

export async function getUserProfile(userId: string, email: string): Promise<UserProfile> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, locale, role")
    .eq("id", userId)
    .maybeSingle();

  return {
    id: userId,
    email,
    username: data?.username ?? null,
    fullName: data?.full_name ?? null,
    avatarUrl: data?.avatar_url ?? null,
    locale: data?.locale ?? "ru",
    role: (data?.role as UserRole) ?? "user",
  };
}

export function displayName(profile: UserProfile): string {
  return profile.fullName ?? profile.username ?? profile.email.split("@")[0] ?? "User";
}

export function displayHandle(profile: UserProfile): string {
  if (profile.username) return `@${profile.username}`;
  return profile.email;
}

export function initials(profile: UserProfile): string {
  const name = displayName(profile);
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export async function getUserEnrollments(
  userId: string,
  locale: Locale,
  email?: string
): Promise<EnrolledCourse[]> {
  const supabase = await createClient();

  let query = supabase
    .from("enrollments")
    .select(
      "created_at, payment_status, scope, courses(*, author_pages(slug, avatar_url, display_name))"
    )
    .in("payment_status", ["free", "paid"])
    .order("created_at", { ascending: false });

  if (email) {
    query = query.or(
      `user_id.eq.${userId},and(is_gift.eq.true,gift_recipient_email.ilike.${email})`
    );
  } else {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;

  if (!data) return [];

  const byCourse = new Map<string, EnrolledCourse>();

  for (const row of data) {
    if (!row.courses || Array.isArray(row.courses)) continue;
    const courseId = (row.courses as { id: string }).id;
    const existing = byCourse.get(courseId);
    const course = mapCourse(row.courses as unknown as DbCourseRow, locale);
    const entry: EnrolledCourse = {
      ...course,
      enrolledAt: row.created_at as string,
      paymentStatus: row.payment_status as EnrolledCourse["paymentStatus"],
    };
    if (!existing || row.scope !== "module") {
      byCourse.set(courseId, entry);
    }
  }

  return [...byCourse.values()];
}
