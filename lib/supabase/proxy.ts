import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { parseDemoSessionPayload } from "@/lib/auth/demo-cookie";
import type { Role } from "@/lib/auth/config";

/**
 * Edge-safe hybrid session guard (no node:crypto / next/headers here).
 * - Supabase mode: refresh auth cookies + validate via getClaims().
 * - Demo mode: structural check of the signed demo_session cookie.
 *   (Pages always re-verify the HMAC signature via requireUser().)
 */

/** Routes that require a session. Individual /api routes self-authorize. */
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/protected"];

/** Login page bounces signed-in users to the dashboard. */
const AUTH_PAGES = ["/auth/login"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

interface AuthClaims {
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

function roleFromClaims(claims: AuthClaims | null): Role {
  const metaRole =
    claims?.app_metadata?.role ?? claims?.user_metadata?.role;
  return metaRole === "admin" ? "admin" : "user";
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // Skip everything when Supabase env vars are absent (demo mode needs none).
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  let userEmail: string | null = null;
  let userRole: Role | null = null;

  if (supabaseConfigured) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Do not run code between createServerClient and getClaims().
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims as AuthClaims | null;
    if (claims?.email) {
      userEmail = claims.email;
      userRole = roleFromClaims(claims);
    }
  } else {
    const payload = parseDemoSessionPayload(
      request.cookies.get("demo_session")?.value,
    );
    if (payload) {
      userEmail = payload.email;
      userRole = payload.role;
    }
  }

  const hasUser = Boolean(userEmail);

  if (isProtected(pathname) && !hasUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasUser && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return the original response so refreshed auth cookies reach
  // the browser (do not create a new NextResponse here).
  return response;
}
