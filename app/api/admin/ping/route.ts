import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/auth-helpers";

/**
 * GET /api/admin/ping — role-gated API example.
 * Non-admins get 403. Copy this pattern for admin-only endpoints:
 *
 *   const auth = await requireApiAdmin(); // or requireApiUser()
 *   if (!auth.ok) return auth.response;
 */
export async function GET(request: Request) {
  void request; // reading the request keeps the handler dynamic
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    ok: true,
    message: `Hello admin ${auth.user.email}`,
    time: new Date().toISOString(),
  });
}
