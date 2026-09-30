/**
 * Supabase barrel — single import point for app code.
 *
 * The underlying clients live in lib/supabase/* (starter kit originals).
 * Import from here in feature code so the location stays stable.
 */

import { getIntegrationStatus } from "@/lib/integrations/status";

export { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
export { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export function isSupabaseConfigured(): boolean {
  return getIntegrationStatus().supabase.configured;
}

export const SUPABASE_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;
