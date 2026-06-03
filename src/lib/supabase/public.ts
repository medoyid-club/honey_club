/**
 * A lightweight Supabase client for reading public data without needing a
 * request context (cookies). Safe to use in Server Components that participate
 * in static generation or ISR.
 */
import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
