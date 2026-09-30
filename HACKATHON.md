# Hackathon Playbook

Everything here takes minutes, not hours. The app already runs — these recipes **wire capabilities in** when you need them.

## 0. Credentials & current state

| Email            | Password | Role  | Works when            |
| ---------------- | -------- | ----- | --------------------- |
| `admin@demo.com` | `123`    | admin | demo mode (no Supabase env) |
| `user@demo.com`  | `456`    | user  | demo mode (no Supabase env) |

Run `npm run dev` → http://localhost:3000. Dashboard integration cards show what's live.

---

## 1. Connect Supabase (auth + database)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (or run `npx supabase init && npx supabase start` locally).
2. Dashboard → **Project Settings → API** → copy the URL and the publishable/anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-or-publishable-key>
   ```
3. Restart `npm run dev`. Login switches to real Supabase auth automatically (demo accounts are bypassed; the hint card disappears).
4. **Roles:** give a user admin by adding to their metadata — Dashboard → Authentication → Users → edit user → `app_metadata`:
   ```json
   { "role": "admin" }
   ```
5. **Passwords:** Supabase requires ≥ 6 chars, so `123` can't exist there. Either use longer passwords or lower the policy: Dashboard → Authentication → Policies → Minimum password length.
6. **Schema:** use the SQL editor for your tables. For row-level security with your Next.js server client, remember RLS still applies — add policies or use the service-role key server-side (never expose it to the client).

Existing client helpers: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), barrel at `lib/integrations/supabase.ts`.

## 2. Connect AI (OpenAI-compatible)

1. Get a key from OpenAI / Groq / OpenRouter / Together — or point at local Ollama.
2. `.env.local`:
   ```
   AI_API_KEY=sk-...
   # AI_BASE_URL=https://api.groq.com/openai/v1   (example override)
   # AI_MODEL=llama-3.1-8b-instant                (example override)
   ```
3. Done — `askAi(prompt)` in `lib/integrations/ai.ts` and `POST /api/ai` now work. Test:
   ```bash
   curl -X POST http://localhost:3000/api/ai \
     -H 'Content-Type: application/json' \
     -b cookies.txt \
     -d '{"prompt":"Say hi"}'
   ```

## 3. Connect Firebase (client SDK)

1. `npm i firebase`
2. Firebase console → Project settings → Your apps → SDK setup (Config) → fill the `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local`.
3. Implement `getFirebaseApp()` in `lib/integrations/firebase.ts` — the commented implementation is already there:
   ```ts
   import { initializeApp, getApp, getApps } from "firebase/app";
   export function getFirebaseApp() {
     return getApps().length ? getApp() : initializeApp(getFirebaseConfig()!);
   }
   ```
4. Add sub-modules as needed (`firebase/auth`, `firebase/firestore`, `firebase/messaging`).

## 4. Connect MCP

**A) Call an external MCP server (client):**
1. `.env.local`: `MCP_SERVER_URL=https://…` (+ optional `MCP_SERVER_TOKEN=`).
2. `npm i @modelcontextprotocol/sdk`
3. Implement `callMcpTool()` in `lib/integrations/mcp.ts` — the transport sketch is in the comments (StreamableHTTP).

**B) Expose this app's tools to Claude/other MCP clients (server):**
- Install the SDK and add `app/api/mcp/route.ts` using `McpServer` + `StreamableHTTPServerTransport`; define tools as `McpServerToolDefinition` objects (`lib/integrations/mcp.ts`).
- Example tool shape:
  ```ts
  {
    name: "get_dashboard_summary",
    description: "Returns current integration status",
    inputSchema: { type: "object", properties: {} },
    handler: async () => getIntegrationStatus(),
  }
  ```

## 5. Webhooks

**Inbound** (e.g. Stripe, GitHub → your app):
- `POST /api/webhooks/<source>` verifies `X-Webhook-Signature` (HMAC-SHA256 over the raw body, `sha256=` prefix tolerated) against `WEBHOOK_SECRET`.
- Set `WEBHOOK_SECRET=<some-long-random-string>` in `.env.local`, then add handlers in the dispatch switch in `app/api/webhooks/[source]/route.ts`.
- Local testing:
  ```bash
  BODY='{"event":"ping"}'
  SIG=$(printf %s "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -hex | sed 's/^.* //')
  curl -X POST http://localhost:3000/api/webhooks/test \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Signature: $SIG" \
    -d "$BODY"
  ```
- For providers with their own signing schemes (Stripe `t=,v1=`, GitHub `X-Hub-Signature-256`), verify their header with the same `verifyWebhookSignature()` helper and the provider's secret.

**Outbound** (your app → somewhere):
```ts
import { sendWebhook } from "@/lib/integrations/webhooks";
await sendWebhook(process.env.OUTGOING_WEBHOOK_URL!, {
  event: "task.completed",
  data: { id: 123 },
});
```

## 6. Adding an authenticated API route

Copy `app/api/admin/ping/route.ts`:

```ts
import { NextResponse } from "next/server";
import { requireApiUser, requireApiAdmin } from "@/lib/api/auth-helpers";

export async function GET() {
  const auth = await requireApiUser(); // or requireApiAdmin()
  if (!auth.ok) return auth.response;
  return NextResponse.json({ hello: auth.user.email });
}
```

## 7. Deploying the demo

1. Push to GitHub — CI (`.github/workflows/ci.yml`) runs lint + build on every push/PR.
2. Deploy to Vercel/Fly/Railway; add env vars in the host dashboard.
3. **Always set `DEMO_SESSION_SECRET` in production** if demo auth is enabled — otherwise the dev fallback secret signs sessions (fine locally, unacceptable deployed).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Login loops back to `/auth/login` | Cookie blocked? Check you're not in incognito-with-blocked-cookies; `DEMO_SESSION_SECRET` must be stable across restarts. |
| Dashboard shows all "Not configured" | Env vars live in `.env.local` (not `.env.example`) — restart the dev server after editing. |
| Supabase login works but `/admin` redirects | The user's `app_metadata.role` isn't `admin` — see recipe 1.4. |
| `/api/ai` returns 501 | Set `AI_API_KEY` (recipe 2). |
| Webhook returns 401 | Signature mismatch — recompute HMAC over the exact raw body bytes. |
