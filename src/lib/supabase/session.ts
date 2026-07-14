import type { SupabaseClient } from "@supabase/supabase-js";

type ClaimsResult = Awaited<ReturnType<SupabaseClient["auth"]["getClaims"]>>;

const loggedOut: ClaimsResult = {
  data: { claims: null },
  error: null,
};

function isTlsOrNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.message === "fetch failed") return true;
  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  if (!cause) return false;
  return (
    cause.code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    cause.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    cause.message?.includes("certificate") === true
  );
}

/** getClaims с graceful fallback при TLS/proxy ошибках в dev. */
export async function getSessionClaims(supabase: SupabaseClient): Promise<ClaimsResult> {
  try {
    return await supabase.auth.getClaims();
  } catch (error) {
    if (process.env.NODE_ENV === "development" && isTlsOrNetworkFailure(error)) {
      console.warn("[auth] Supabase недоступен (TLS/сеть) — сессия не обновлена.");
      return loggedOut;
    }
    throw error;
  }
}

export function isSandboxPathname(pathname: string): boolean {
  return /\/sandbox(?:\/|$)/.test(pathname);
}
