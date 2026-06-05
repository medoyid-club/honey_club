import { redirect } from "next/navigation";

import type { UserRole } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub as string,
    email: (claims.email as string | undefined) ?? "",
    role: (profile?.role as UserRole) ?? "user",
  };
}

export async function requireRole(
  locale: string,
  roles: UserRole[],
  redirectTo?: string
): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    const target = redirectTo ?? `/${locale}/account`;
    redirect(`/${locale}/login?redirect=${target}`);
  }

  if (!roles.includes(user.role)) {
    redirect(`/${locale}/account`);
  }

  return user;
}
