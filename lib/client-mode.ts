/**
 * Client-safe "is demo mode" flag.
 *
 * The server decides mode via NEXT_PUBLIC_SUPABASE_URL presence — a
 * NEXT_PUBLIC var, so the client can read the same signal directly.
 * Keeps client components from importing server-only session code.
 */
export const isDemoAuthMode: boolean = !process.env.NEXT_PUBLIC_SUPABASE_URL;
