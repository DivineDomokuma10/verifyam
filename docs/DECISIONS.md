# VERIFY — Decision Log

Record of product and technical decisions made during planning. Newest first.

## Deploy: Vercel (client) + Render (server), single monorepo — 2026-08-20

- **Decision:** Client on **Vercel** (Root Directory `client`), server as a Node web service on **Render** via `render.yaml`. Both deploy from the **same repo** (pnpm workspace); Vercel and Render each build their package from the shared lockfile.
- **Rationale:** Vercel is the native Next.js host with zero config; Render runs the Express service simply (build → `prisma migrate deploy` → `tsx` start). One repo avoids duplicated CI and API/client version drift.
- **Effects:** No `vercel.json` needed (auto-detect; root dir set in dashboard). `render.yaml` pins Node 22, runs `prisma:generate:prod` at build and `prisma:migrate:prod && start` at boot, health-checked on `/api/health`.

## Cross-site session cookie: SameSite=None + Secure in prod — 2026-08-20

- **Decision:** `setSessionCookie` sets `sameSite: "none"` and `secure: true` when `NODE_ENV=production` (kept `lax`/insecure on localhost). CORS stays exact-origin (`CORS_ORIGINS`), `credentials: true`.
- **Rationale:** Vercel (`*.vercel.app`) and Render (`*.onrender.com`) are different registrable domains — `SameSite=Lax` cookies are never sent on cross-site XHR, so auth would silently break. `SameSite=None` requires `Secure` (HTTPS), which both platforms provide.

## Dual Prisma schema: SQLite dev, Postgres prod — 2026-08-20

- **Decision:** Keep SQLite for local dev and Postgres for prod via **two schema files** (`server/prisma/schema.sqlite.prisma` dev, `server/prisma/postgresql/schema.prisma` prod), each with its own `migrations/` directory and `prisma:*` scripts (`prisma:generate`/`prisma:migrate` vs `prisma:generate:prod`/`prisma:migrate:prod`).
- **Rationale:** Prisma fixes one provider per schema and derives the migrations dir from the schema location, so per-environment schemas are the low-drift way to keep dev DB-free. Field types stay identical (`Float`, JSON-as-`String`) so the two schemas never diverge; `Decimal`/`Json` promotion is a later cleanup.
- **Effect:** The generated Prisma client is provider-specific — each environment generates its own (dev generates SQLite, Render generates Postgres at build). Initial Postgres migration was produced with `prisma migrate diff --from-empty`.

## Prod runtime: tsx (no bundler) — 2026-08-20

- **Decision:** Run the production server with `tsx src/index.ts` (existing `start` script), no esbuild/tsc build step.
- **Rationale:** `tsx` handles TypeScript and the `@/*` path aliases natively, is already a dependency, and avoids bundler friction with Prisma. Accepted for a startup-scale API; can move to a bundled build if runtime overhead ever matters.

## Deploy with CALL-E mock first — 2026-08-20

- **Decision:** First deploy keeps `CALLE_MOCK=true` so the full live stack (auth → parse → verification → webhook → report) can be smoke-tested without spending CALL-E credits or needing a supported region. Flip to real calls via env vars (`CALLE_MOCK=false`, `CALLE_API_KEY`, `CALLE_WEBHOOK_URL`, supported `CALLE_REGION`) when ready.

## Client data layer: axios wrapper + React Query + zustand — 2026-08-19

- **Decision:** Replace the planned `lib/api.ts` fetch wrapper with `utils/call-api/` (axios instance, `withCredentials`, env base URL, request/response interceptors), typed endpoint classes in `api/`, React Query hooks in `hook/queries/`, and zustand stores for session/auth.
- **Rationale:** Centralizes auth handling (401 interceptor), simplifies loading/error states via React Query, and keeps session state reactive across components. Supersedes the "add `lib/api.ts`" note in earlier docs.

## Client route guarding: client-side `ProtectRoutes` — 2026-08-19

- **Decision:** A root-level `ProtectRoutes` component checks the session on load and redirects unauthenticated users to `/login?next=<path>`; authenticated users hitting `/login`/`/signup` are bounced to `/dashboard`. Only `/` is public (plus auth pages).
- **Rationale:** No server-side auth pages needed for v1; keeps the auth gate simple and works with the session cookie.

## URL parsing via cheerio (OG + JSON-LD), not Playwright — 2026-08-19

- **Decision:** Generic server-side scraper using `cheerio`: Open Graph tags for title/description/image, JSON-LD extraction for address/price, and title heuristics for a suggested address. Manual form is the fallback when parsing fails.
- **Rationale:** Works across any site without per-domain Playwright setups; no browser process on the server. Playwright per-domain scraping remains a future enhancement for sites that block fetching.

## CALL-E async create + webhook (not createAndWait) — 2026-08-19

- **Decision:** Create calls asynchronously with `client.calls.create(...)` + `webhookUrl` + `metadata: { verificationId, attempt }` + idempotency key; terminal results arrive at `POST /api/webhooks/calle`.
- **Rationale:** Matches the 24h turnaround model (no request held open) and lets the mock provider replay webhooks locally. `createAndWait` only fits a synchronous path we don't need.

## Local mock CALL-E provider — 2026-08-19

- **Decision:** `CALLE_MOCK=true` (default) uses a `MockCalleProvider` that fires the terminal webhook locally after a delay, with switchable scenarios: `verified`, `warning`, `inconclusive`, `no_answer`, `no_answer_then_verified`.
- **Rationale:** Zero-cost local dev without an API key or real phone calls; scenarios exercise every verdict + retry path. Flip `CALLE_MOCK=false` for real calls.

## Retry logic: hybrid rule, MAX_ATTEMPTS = 2 — 2026-08-19

- **Decision:** Retry only on transient failure — no usable conversation (failed call / empty transcript) or `completionConfidence.score < 0.5`. If the recipient answered but couldn't confirm, finalize as inconclusive instead of retrying. Max 2 attempts total.
- **Rationale:** Avoids burning a second call when it can't change the outcome; keeps the 24h turnaround honest.

## Webhook verification: event-id header + dedup table — 2026-08-19

- **Decision:** `POST /api/webhooks/calle` validates the `CALL-E-Event-Id` header against the body `id` and records seen events in a `WebhookEvent` table to dedupe replays. Supersedes the earlier "shared internal token" idea.
- **Rationale:** Event-id matching + idempotent processing is the provider-native pattern; the dedup table makes retries safe.

## Phone normalization via libphonenumber-js — 2026-08-19

- **Decision:** Agent phones are normalized to E.164 at submission (`phone.service.ts`) using `libphonenumber-js` with `DEFAULT_PHONE_REGION` (default `NG`).
- **Rationale:** Ensures the CALL-E provider gets a dialable number and rejects bad input at the API boundary.

## API shape: /api prefix, GET logout — 2026-08-19

- **Decision:** All backend routes are mounted under `/api/*` (`/api/auth`, `/api/verifications`, `/api/webhooks`, `/api/health`); logout is a `GET /api/auth/logout`. Responses use `{ status, message, data }`.
- **Rationale:** Clean separation from the client origin on deploy; consistent envelope makes the client wrapper trivial.

## SQLite for dev, Postgres for prod — 2026-08-14

- **Decision:** Dev uses SQLite; switch to PostgreSQL when production is ready.
- **Rationale:** Zero-install local dev on Windows (no Postgres/Docker present). Prisma makes the swap low-cost.
- **Effects:** `price` is `Float` and `structuredResult` is `String` (JSON text) because SQLite lacks Prisma `Decimal`/`Json` types. Promote to `Decimal`/`Json` on the Postgres migration.

## CALL-E result schema + task prompt — 2026-08-14

- **Decision:** Granular 7-check result schema (`isReal`, `isAvailable`, `priceMatches`, `photosAccurate`, `sizeMatches`, `amenitiesMatch`, `moveInDateConfirmed`) + `scamSignals` array and `notes`. Task prompt uses **goal + outcomes + no-answer rule** style.
- **Rationale:** Maps 1:1 to the six "What we verify" cards (real / available / accurate / not-a-scam) and the report fields. The no-answer rule ("mark `unknown`, never guess") prevents fabricated `no` answers and guarantees clean JSON.
- **Verdict guard:** `Verified` requires only `isReal`, `isAvailable`, `priceMatches` = `yes` and no scam signals — honest "I don't know" on secondary fields (photos/size/amenities/move-in) must not fail a listing or blow the 24h turnaround.
- **Prompt style rejected:** minimal single sentence (no no-answer handling, ambiguous schema mapping) and fully scripted dialogue (brittle against real conversations, doesn't fit CALL-E's goal-driven model).

## Accounts-only (no anonymous verification) — 2026-08-14

- **Decision:** Drop the anonymous verification idea entirely. Every verification requires a user account.
- **Rationale:** Simplifies the product (no lost-on-close UX, no expiring token URLs, no re-linking anonymous verifications), guarantees history is always tracked, and improves retention.
- **Effects:** `/verify` requires auth; no anonymous path in the API or data model. Email notification still deferred (on-page + dashboard in v1).

## No SMS follow-up — 2026-08-14

- **Decision:** Verification is done by phone call only; no SMS follow-up.
- **Rationale:** CALL-E's call flow handles retries; adding SMS complicates the loop without a clear v1 need.

## URL + manual fallback submission — 2026-08-14

- **Decision:** Support both (a) paste-a-URL with parse preview and (b) a manual form fallback for listings that don't parse (Facebook, Craigslist, screenshots).
- **Rationale:** The marketing copy promises "Works with any listing" — a URL-only flow contradicts that promise.

## Full sign-up/login + history in v1 — 2026-08-14

- **Decision:** Accounts and dashboard history are part of the first release, not a later phase.

## Backend stack — 2026-08-14

- **Decision:** Express + TypeScript + Prisma as a separate service in a pnpm workspace alongside the client. SQLite for dev; PostgreSQL for production (see "SQLite for dev, Postgres for prod" above).
- **Rationale:** Simple, well-known, matches the `@call-e/calle` TypeScript SDK, and keeps client/server in the same language.

## CALL-E as the phone-call provider — 2026-08-14

- **Decision:** Use CALL-E (`@call-e/calle` SDK / `https://api.heycall-e.com`) for AI phone calls to agents/landlords.
- **Provider facts:** 20 free calls on signup; goal-driven calls; returns status, `taskCompleted`, `completionConfidence`, `structuredResult`, `evidence`, transcript. Webhooks for terminal results.
- **Region note:** Nigeria is "International" (test-only until a local line is enabled); US/SG/MY/IN/AE/AU are local-ready.

## Defer email in v1 — 2026-08-14

- **Decision:** Ship auth/flow without email. Account notifications are on-page + dashboard only for v1. Email (e.g. Resend) is a follow-up.

## Free for renters — 2026-08-14

- **Decision:** Verification is free; renters are the paying focus for conversion. Landlord badge monetization is a future phase.

## 24h standard turnaround only — 2026-08-14

- **Decision:** Single 24-hour turnaround tier. No paid urgent tier in v1.

## AI is a tool, not the message — 2026-08-14

- **Decision:** Landing page copy centers on the verification outcome ("real, available, accurate"), not AI technology.

## Theme/font decisions — 2026-08-14

- **Theme:** dark/light via `next-themes` (`attribute="class"`, `defaultTheme="system"`).
- **Fonts:** self-hosted via `next/font` — Raleway (sans), Merriweather (heading), JetBrains Mono (mono). Geist/Geist Mono dropped as unused. Self-hosting preferred over Google CDN for performance/privacy.

## Landing page content approved — 2026-08-14

- Sections: Hero, Problem, How It Works (3 steps), What We Verify (6 checks), Two Audiences, FAQ, Final CTA.
- **Stats section removed** (no real data yet); content lives in `client/CONTENT.md` and `client/lib/constants.ts`.