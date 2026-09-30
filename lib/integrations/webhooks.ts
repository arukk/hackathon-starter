/**
 * Webhook helpers — inbound verification + outbound sending.
 *
 * Inbound:  app/api/webhooks/[source]/route.ts verifies HMAC signatures
 *           against WEBHOOK_SECRET (see verifyWebhookSignature).
 * Outbound: sendWebhook() posts signed payloads to OUTGOING_WEBHOOK_URL
 *           (or any URL you pass).
 *
 * Configure in .env.local:
 *   WEBHOOK_SECRET=my-shared-secret
 *   OUTGOING_WEBHOOK_URL=https://example.com/hook   (optional)
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export function isWebhooksConfigured(): boolean {
  return Boolean(process.env.WEBHOOK_SECRET);
}

/** Constant-time HMAC-SHA256 signature check. */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "").trim();
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Produces the X-Webhook-Signature header value for outbound payloads. */
export function signWebhookPayload(
  payload: string,
  secret: string,
): string {
  return `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export interface SendWebhookResult {
  ok: boolean;
  status: number;
  body: string;
}

/** Signs and POSTs a JSON payload; returns response status/body. */
export async function sendWebhook(
  url: string,
  payload: Record<string, unknown>,
): Promise<SendWebhookResult> {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "WEBHOOK_SECRET is not set. Add it to .env.local (see HACKATHON.md → Webhooks).",
    );
  }
  const body = JSON.stringify(payload);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signWebhookPayload(body, secret),
    },
    body,
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}
