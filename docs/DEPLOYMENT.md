# VERIFY — Deployment runbook (Vercel + Render)

Deploys the monorepo: client on **Vercel**, server on **Render**. Both build from the
same repo + pnpm workspace.

**Prereq:** the repo must be on GitHub (Render and Vercel import from it).

```bash
git remote add origin https://github.com/<YOUR_GITHUB>/verify.git
git push -u origin main
```

---

## 1. Render — API server

### Option A (recommended): Blueprint

1. [Render dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Select the repo. Render finds `render.yaml` → it will create the `verify-api` web service.
3. Create a database:
   - **New** → **PostgreSQL** → **Free** (1 GB). Copy its **Internal Database URL**.
   - Or use external Postgres (Neon/Supabase) and set `DATABASE_URL` manually.
4. On the `verify-api` service → **Environment** → add:

   | Key | Value |
   | --- | ----- |
   | `DATABASE_URL` | Postgres connection string |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGINS` | `https://<your-client>.vercel.app` (exact origin, no trailing slash) |
   | `COOKIE_NAME` | `verify_session` |
   | `CALLE_MOCK` | `true` (flip to `false` when ready — see below) |
   | `CALLE_REGION` | `NG` (supported; NG routes via CALL-E international lines) |
   | `CALLE_LOCALE` | `en-NG` |
   | `DEFAULT_PHONE_REGION` | `NG` |
   | `CALLE_API_KEY` | (only when `CALLE_MOCK=false`) |
   | `CALLE_WEBHOOK_URL` | (only when `CALLE_MOCK=false`) `https://<your-api>.onrender.com/api/webhooks/calle` |

5. **Manual deploy** → watch logs for `Server listening on ...` and health check green.

### Option B: manual web service

Same values, applied to a Web Service created from the repo with:

- Runtime: Node, `NODE_VERSION=22`
- Build: `pnpm install --frozen-lockfile && pnpm --filter @verify/server prisma:generate:prod`
- Start: `pnpm --filter @verify/server prisma:migrate:prod && pnpm --filter @verify/server start`
- Health check path: `/api/health`

### Verify

```bash
curl https://<your-api>.onrender.com/api/health
# {"status":"ok"}
```

> **Free tier caveat:** Render free services sleep after ~15 min idle → cold start delay
> on first request and no background mock calls while asleep. Fine for judging; upgrade
> to Starter (or add an uptime ping) before the demo.

---

## 2. Vercel — client

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import the repo.
2. **Root Directory:** `client` (the Next.js app lives there).
3. Framework preset: Next.js (auto-detected). Build command: `next build` (default).
4. **Environment Variables:**
   - `NEXT_PUBLIC_BACKEND_URL` = `https://<your-api>.onrender.com`
5. **Deploy.**

> The axios wrapper reads `NEXT_PUBLIC_BACKEND_URL` at build time — it is inlined, so
> change + redeploy if the Render URL changes.

---

## 3. Post-deploy smoke test

1. Open `https://<your-client>.vercel.app` → **Verify a listing** → sign up.
2. DevTools → Application → Cookies: confirm the session cookie is
   `SameSite=None; Secure` (cross-site between Vercel and Render).
3. Submit a listing (mock mode: `CALLE_MOCK=true` fires a simulated call in-process after
   `CALLE_MOCK_DELAY_MS`). Watch the `/verify/[id]` page move *pending → calling → completed*.
4. Confirm the report renders (verdict, checks, red flags, transcript) and appears in the dashboard.

If auth fails in prod: re-check `CORS_ORIGINS` (must match the Vercel origin exactly) and
that the cookie is `SameSite=None` + `Secure`.

---

## 4. Flip to real calls

When you have your CALL-E API key and credits (20 free on signup):

1. `CALLE_MOCK=false`
2. `CALLE_API_KEY=calle_live_...`
3. `CALLE_WEBHOOK_URL=https://<your-api>.onrender.com/api/webhooks/calle`
4. Region: `NG` works via CALL-E international lines (test-oriented). For a local line in a
   specific country, set `CALLE_REGION` + `CALLE_LOCALE` to a supported one
   (US/SG/MY/IN/AE/AU/MX/BR have local lines).
5. Deploy, then verify with a phone number you own or are authorized to call:
   - Create a verification → status flips to `calling` → CALL-E dials → webhook arrives
     → `completed` with a real transcript.
   - Confirm the webhook was accepted (server logs; the `WebhookEvent` dedup row).

Webhook notes (verified against CALL-E docs):
- Deliveries are **unsigned** — no secret/signature headers.
- Authentication is the **`CALL-E-Event-Id`** header, which must equal the body `id`;
  consumers dedupe at-least-once deliveries. Our `verifyWebhook` middleware implements
  exactly this and records events in the `WebhookEvent` table.

---

## 5. Environment summary

| Var | Client | Server | Required |
| --- | ------ | ------ | -------- |
| `NEXT_PUBLIC_BACKEND_URL` | ✅ | — | prod |
| `DATABASE_URL` | — | ✅ (Postgres) | prod |
| `CORS_ORIGINS` | — | ✅ client origin | prod |
| `CALLE_MOCK` | — | `true` default | dev; prod flips |
| `CALLE_API_KEY` | — | ✅ | real calls |
| `CALLE_WEBHOOK_URL` | — | ✅ | real calls |
| `CALLE_REGION` / `CALLE_LOCALE` / `DEFAULT_PHONE_REGION` | — | ✅ | as needed |