/**
 * Demo-mode auth configuration.
 *
 * Used when Supabase env vars are NOT set (see lib/integrations/status.ts).
 * When Supabase is configured, these users are bypassed and real
 * Supabase auth takes over — no code changes needed.
 */

export type Role = "admin" | "user";

export interface DemoUser {
  email: string;
  password: string;
  role: Role;
  name: string;
}

export const DEMO_USERS: readonly DemoUser[] = [
  {
    email: "admin@demo.com",
    password: "123",
    role: "admin",
    name: "Admin",
  },
  {
    email: "user@demo.com",
    password: "456",
    role: "user",
    name: "Demo User",
  },
] as const;

export function findDemoUser(
  email: string,
  password: string,
): DemoUser | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find(
    (u) => u.email === normalized && u.password === password,
  );
}

/** Unified identity shape returned by getCurrentUser() in both auth modes. */
export interface CurrentUser {
  email: string;
  role: Role;
  name: string;
  /** Which auth backend produced this session. */
  provider: "demo" | "supabase";
}
