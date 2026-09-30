import { NextResponse } from "next/server";
import {
  isWebhooksConfigured,
  verifyWebhookSignature,
} from "@/lib/integrations/webhooks";

/**
 * POST /api/webhooks/[source] — generic signed webhook receiver.
 *
 * Security: verifies an HMAC-SHA256 signature over the RAW body against
 * WEBHOOK_SECRET (constant-time compare). Signature header name follows
 * the common `X-Webhook-Signature` / `x-signature` style (value may be
 * prefixed with `sha256=`).
 *
 * Wire up real handlers in the switch below during the hackathon:
 *   source === "stripe"  → verify with STRIPE_WEBHOOK_SECRET instead
 *   source === "github"  → X-Hub-Signature-256, GH_WEBHOOK_SECRET
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ source: string }> },
) {
  const { source } = await params;

  if (!isWebhooksConfigured()) {
    return NextResponse.json(
      {
        error: "Webhooks are not configured.",
        hint: "Set WEBHOOK_SECRET in .env.local (see HACKATHON.md → Webhooks).",
      },
      { status: 501 },
    );
  }

  // Raw body — signatures are computed over bytes, never parsed JSON.
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-webhook-signature") ??
    request.headers.get("x-signature");

  const secret = process.env.WEBHOOK_SECRET!;
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = rawBody; // allow non-JSON payloads (form posts, plain text)
  }

  // ── Dispatch point ────────────────────────────────────────────────
  switch (source) {
    // case "stripe":
    //   await handleStripe(payload); break;
    default:
      console.log(`[webhook:${source}] received`, typeof payload);
  }

  return NextResponse.json({ ok: true, source });
}

/** GET /api/webhooks/[source] — handy for connectivity checks. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ source: string }> },
) {
  const { source } = await params;
  return NextResponse.json({
    ok: true,
    source,
    configured: isWebhooksConfigured(),
    method: "POST with X-Webhook-Signature header (HMAC-SHA256 of body)",
  });
}
