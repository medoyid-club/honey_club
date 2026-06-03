"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "ru";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}&tab=login`);
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "ru";

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}&tab=register`);
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/login?tab=login`);
}
