import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Apply next-intl routing (locale redirects/rewrites).
  const intlResponse = intlMiddleware(request);
  let response: NextResponse =
    intlResponse instanceof NextResponse
      ? intlResponse
      : NextResponse.next({ request });

  // 2. Refresh Supabase Auth session and write updated cookies onto the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create response to include updated cookies.
          const updated = NextResponse.next({ request });
          // Copy over intl headers (Location, etc.) so redirects still work.
          response.headers.forEach((value, key) => {
            updated.headers.set(key, value);
          });
          response.cookies.getAll().forEach(({ name, value }) => {
            updated.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            updated.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            updated.headers.set(key, value);
          });
          response = updated;
        },
      },
    }
  );

  // IMPORTANT: Do not put any code between createServerClient and getClaims().
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
