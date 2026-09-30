import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { CurrentUser, Role } from "@/lib/auth/config";
import {
  DEMO_SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  parseDemoSessionPayload,
  type DemoSessionPayload,
} from "@/lib/auth/demo-cookie";

export { DEMO_SESSION_COOKIE, hasPlausibleDemoCookie } from "@/lib/auth/demo-cookie";
export type { CurrentUser } from "@/lib/auth/config";

/* ------------------------------------------------------------------ */
/* Demo session cookie (signed, httpOnly) — node:crypto side           */
/* ------------------------------------------------------------------ */

/**
 * Dev-only fallback so the demo works with zero setup.
 * Set DEMO_SESSION_SECRET in .env.local for anything real.
 */
function sessionSecret(): string {
  return process.env.DEMO_SESSION_SECRET ?? "hackathon-dev-secret-do-not-ship";
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret())
    .update(value)
    .digest("base64url");
}

function encodeSession(payload: DemoSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Full cryptographic verification — used by server components/route handlers. */
function decodeSession(raw: string | undefined): DemoSessionPayload | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return parseDemoSessionPayload(raw);
}

export function createDemoSessionCookie(
  email: string,
  role: Role,
  name: string,
): { name: string; value: string; options: CookieOptions } {
  const now = Math.floor(Date.now() / 1000);
  const value = encodeSession({
    email,
    role,
    name,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  });
  return {
    name: DEMO_SESSION_COOKIE,
    value,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export function clearDemoSessionCookie(): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  return {
    name: DEMO_SESSION_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Supabase session (server-side)                                      */
/* ------------------------------------------------------------------ */

/**
 * Supabase server client bound to a Next.js cookie store. Guard callers
 * with isSupabaseConfigured() — createServerClient throws on empty URL.
 */
export function createSupabaseServerClient(cookieStore: {
  getAll(): { name: string; value: string }[];
  set(name: string, value: string, options?: CookieOptions): void;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore when the
            // proxy refreshes sessions on every request.
          }
        },
      },
    },
  );
}

function roleFromSupabaseUser(user: User): Role {
  const metaRole =
    (user.app_metadata as Record<string, unknown> | null)?.role ??
    (user.user_metadata as Record<string, unknown> | null)?.role;
  return metaRole === "admin" ? "admin" : "user";
}

function userToCurrentUser(user: User): CurrentUser {
  return {
    email: user.email ?? "",
    role: roleFromSupabaseUser(user),
    name:
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "user",
    provider: "supabase",
  };
}

/* ------------------------------------------------------------------ */
/* Unified session accessors                                           */
/* ------------------------------------------------------------------ */

/**
 * Returns the current user from whichever backend is active:
 * - Supabase mode (env vars set): validated via supabase.auth.getUser().
 * - Demo mode: the signed demo_session cookie (HMAC verified here).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createSupabaseServerClient(store);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ? userToCurrentUser(user) : null;
  }

  const payload = decodeSession(store.get(DEMO_SESSION_COOKIE)?.value);
  if (!payload) return null;
  return {
    email: payload.email,
    role: payload.role,
    name: payload.name,
    provider: "demo",
  };
}

/** Server-component helper: redirect to /auth/login when signed out. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

/** Server-component helper: admin-only pages. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
