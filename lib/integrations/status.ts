/**
 * Single source of truth for integration availability.
 *
 * Add an env var to `.env.local` (copy `.env.example`) and the dashboard
 * status card flips automatically. Server-side only — never import this
 * from a client component, it reads process.env at runtime.
 */

export type IntegrationKey =
  | "supabase"
  | "firebase"
  | "ai"
  | "mcp"
  | "webhooks";

export interface IntegrationStatus {
  configured: boolean;
  /** env vars expected for this integration (for the dashboard hint) */
  envVars: string[];
  docs: string;
}

const bool = (v: string | undefined) => Boolean(v && v.length > 0);

export function getIntegrationStatus(): Record<
  IntegrationKey,
  IntegrationStatus
> {
  return {
    supabase: {
      configured: bool(process.env.NEXT_PUBLIC_SUPABASE_URL),
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
      docs: "HACKATHON.md → Connect Supabase",
    },
    firebase: {
      configured:
        bool(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
        bool(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      envVars: [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ],
      docs: "HACKATHON.md → Connect Firebase",
    },
    ai: {
      configured: bool(process.env.AI_API_KEY),
      envVars: ["AI_API_KEY", "AI_BASE_URL?", "AI_MODEL?"],
      docs: "HACKATHON.md → Connect AI",
    },
    mcp: {
      configured: bool(process.env.MCP_SERVER_URL),
      envVars: ["MCP_SERVER_URL", "MCP_SERVER_TOKEN?"],
      docs: "HACKATHON.md → Connect MCP",
    },
    webhooks: {
      configured: bool(process.env.WEBHOOK_SECRET),
      envVars: ["WEBHOOK_SECRET", "OUTGOING_WEBHOOK_URL?"],
      docs: "HACKATHON.md → Webhooks",
    },
  };
}

/** True when real Supabase env vars exist (drives hybrid auth switching). */
export function isSupabaseConfigured(): boolean {
  return bool(process.env.NEXT_PUBLIC_SUPABASE_URL);
}
