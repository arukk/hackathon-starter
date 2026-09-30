# Hackathon Starter

Next.js 15 (App Router) + Tailwind CSS + shadcn/ui starter with working auth out of the box, a dashboard, and scaffolding ready to wire for **Supabase**, **Firebase**, **AI**, **MCP** and **webhooks** — plus example API routes and CI.

Forked from the [Next.js + Supabase Starter Kit](https://github.com/vercel/next.js/tree/canary/examples/with-supabase).

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — **no configuration required**. The app boots in demo mode.

### Demo accounts

| Email             | Password | Role  |
| ----------------- | -------- | ----- |
| `admin@demo.com`  | `123`    | admin |
| `user@demo.com`   | `456`    | user  |

## Routes

| Route           | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `/`             | Landing page (empty by design — add your content here)         |
| `/auth/login`   | Login (demo accounts in demo mode, Supabase auth once wired)   |
| `/dashboard`    | Authenticated dashboard + integration status cards             |
| `/admin`        | Admin-only page (server-side role gate)                        |
| `/api/health`   | Liveness + integration/session snapshot                        |
| `/api/ai`       | `POST { prompt }` — OpenAI-compatible proxy (501 until keyed)  |
| `/api/admin/ping` | Role-gated API example (403 for non-admins)                  |
| `/api/webhooks/[source]` | HMAC-verified webhook receiver                        |

## How hybrid auth works

- **No Supabase env vars** → demo mode: the login form validates against the built-in demo accounts and sets a signed, httpOnly `demo_session` cookie (HMAC-SHA256, 7 days).
- **`NEXT_PUBLIC_SUPABASE_URL` set** → real Supabase auth takes over automatically; roles come from the user's `app_metadata.role` (or `user_metadata.role`).
- Everything reads one helper: `getCurrentUser()` → `{ email, role, name, provider }`.

Route protection lives in `proxy.ts` (edge): `/dashboard`, `/admin`, `/protected` require a session; signed-in users are bounced from `/auth/login` to `/dashboard`. Pages re-verify server-side via `requireUser()` / `requireAdmin()` — never trust the proxy alone.

## Wiring an integration mid-hackathon

Full step-by-step recipes in [HACKATHON.md](HACKATHON.md). Short version:

1. Copy `.env.example` → `.env.local`, fill the section you need.
2. Follow the matching recipe (Supabase / Firebase / AI / MCP / webhooks).
3. The dashboard card flips to **Connected** automatically.

Supabase note: its minimum password length is 6 — the demo `123` password works only in demo mode. Lower the policy in the Supabase dashboard if you want the same accounts there.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build (also the CI check)
npm run lint    # eslint
npm start       # serve the production build
```

## Deploying

Any Node host works (Vercel, Fly, Railway…). Set the env vars you need in the host's dashboard; the app degrades gracefully to demo mode when they're absent. **Set `DEMO_SESSION_SECRET` whenever you deploy with demo auth enabled.**
