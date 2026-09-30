import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

/**
 * Shared auth helpers for API route handlers.
 * getCurrentUser() verifies the demo cookie HMAC or the Supabase session,
 * so API auth is as strong as page auth.
 */

export type ApiAuthResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; response: NextResponse };

export async function requireApiUser(): Promise<ApiAuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

/** Discriminated-union friendly admin gate (combine with a role check). */
export async function requireApiAdmin(): Promise<ApiAuthResult> {
  const result = await requireApiUser();
  if (!result.ok) return result;
  if (result.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden — admin role required." },
        { status: 403 },
      ),
    };
  }
  return result;
}
