/**
 * Edge-safe demo-cookie primitives (pure JS — no node:crypto, no Buffer).
 *
 * The proxy imports ONLY this file so it stays bundle-safe on the edge
 * runtime. Signature verification (node:crypto) lives in
 * lib/auth/session.ts, which server components and route handlers use —
 * so pages always re-verify what the proxy only structurally checked.
 *
 * Cookie format: base64url(JSON payload) + "." + base64url(HMAC-SHA256)
 */

export const DEMO_SESSION_COOKIE = "demo_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

import type { Role } from "@/lib/auth/config";

export interface DemoSessionPayload {
  email: string;
  role: Role;
  name: string;
  /** issued-at, unix seconds */
  iat: number;
  /** expires-at, unix seconds */
  exp: number;
}

const B64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Pure-JS base64url → bytes (UTF-8 safe via TextDecoder). */
function base64UrlToBytes(input: string): Uint8Array | null {
  const clean = input.replace(/=+$/, "");
  let acc = 0;
  let bits = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = B64_ALPHABET.indexOf(ch);
    if (idx === -1) return null;
    acc = (acc << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Structural (NOT cryptographic) check used by the proxy to gate redirects.
 * A forged cookie may pass this, but pages call requireUser()/getCurrentUser()
 * which verify the HMAC signature fully before rendering anything.
 */
export function hasPlausibleDemoCookie(raw: string | undefined): boolean {
  const payload = parseDemoSessionPayload(raw);
  return payload !== null;
}

/** Unsigned payload parse — proxy use only. */
export function parseDemoSessionPayload(
  raw: string | undefined,
): DemoSessionPayload | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const bytes = base64UrlToBytes(raw.slice(0, dot));
  if (!bytes) return null;
  try {
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Partial<DemoSessionPayload>;
    if (
      typeof parsed.email !== "string" ||
      (parsed.role !== "admin" && parsed.role !== "user") ||
      typeof parsed.exp !== "number" ||
      parsed.exp * 1000 < Date.now()
    ) {
      return null;
    }
    return parsed as DemoSessionPayload;
  } catch {
    return null;
  }
}
