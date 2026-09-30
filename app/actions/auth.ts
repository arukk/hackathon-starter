"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/integrations/status";
import { findDemoUser } from "@/lib/auth/config";
import {
  clearDemoSessionCookie,
  createDemoSessionCookie,
  createSupabaseServerClient,
} from "@/lib/auth/session";

export interface LoginState {
  error: string | null;
}

/**
 * Unified login server action.
 * - Supabase mode: signInWithPassword.
 * - Demo mode: validate against DEMO_USERS, set signed cookie.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const store = await cookies();

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient(store);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
  } else {
    const match = findDemoUser(email, password);
    if (!match) {
      return { error: "Invalid email or password." };
    }
    const cookie = createDemoSessionCookie(match.email, match.role, match.name);
    store.set(cookie.name, cookie.value, cookie.options);
  }

  redirect("/dashboard");
}

/** Logout works in both modes. */
export async function logout(): Promise<void> {
  const store = await cookies();

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient(store);
    await supabase.auth.signOut();
  }

  const cookie = clearDemoSessionCookie();
  store.set(cookie.name, cookie.value, cookie.options);
  redirect("/auth/login");
}
