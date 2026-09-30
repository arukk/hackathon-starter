import { NextResponse } from "next/server";
import { getIntegrationStatus } from "@/lib/integrations/status";
import { getCurrentUser } from "@/lib/auth/session";

/** GET /api/health — liveness probe + integration/session snapshot. */
export async function GET(request: Request) {
  void request; // reading the request keeps the handler dynamic
  let session: { email: string; role: string; provider: string } | null = null;
  try {
    const user = await getCurrentUser();
    session = user
      ? { email: user.email, role: user.role, provider: user.provider }
      : null;
  } catch {
    session = null;
  }

  return NextResponse.json({
    ok: true,
    service: "hackathon-starter",
    time: new Date().toISOString(),
    integrations: Object.fromEntries(
      Object.entries(getIntegrationStatus()).map(([key, value]) => [
        key,
        value.configured,
      ]),
    ),
    session,
  });
}
