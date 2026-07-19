import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";
import { getSessionClaims, isSandboxPathname } from "./lib/supabase/session";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isSandbox = isSandboxPathname(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Apply next-intl routing (locale redirects/rewrites).
  const intlResponse = intlMiddleware(request);

  if (intlResponse instanceof NextResponse && intlResponse.headers.get("Location")) {
    return intlResponse;
  }

  let response: NextResponse =
    intlResponse instanceof NextResponse
      ? intlResponse
      : NextResponse.next({ request: { headers: requestHeaders } });

  if (intlResponse instanceof NextResponse) {
    response = NextResponse.next({ request: { headers: requestHeaders } });
    intlResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    intlResponse.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value);
    });
  }

  // Sandbox — локальная песочница без бэкенда; Supabase не нужен.
  if (isSandbox) {
    return response;
  }

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          const updated = NextResponse.next({ request: { headers: requestHeaders } });
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
    },
  );

  // IMPORTANT: Do not put any code between createServerClient and getClaims().
  await getSessionClaims(supabase);

  return response;
}

export const config = {
  // Exclude metadata routes (/icon, /apple-icon) and static files (paths with a dot).
  matcher: ["/((?!api|auth|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
