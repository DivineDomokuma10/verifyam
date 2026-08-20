# VERIFY — Architecture

> **Status (2026-08-20):** Phases 1–5 implemented. Auth, verification flow (URL parse + manual), CALL-E integration (mock + real), result engine with retries, and the full client flow (`/verify`, `/verify/[id]`, `/login`, `/signup`, `/dashboard`) are all live. **Deploy config is in place** (Vercel for the client, Render for the server via `render.yaml`, Postgres via a separate prod-only Prisma schema). First deploy runs with CALL-E mock mode; flip to real calls via env vars.

## Stack

- **Client:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui — implemented. Landing page, auth pages, verify flow, and dashboard all wired to the backend.
- **Server:** Express + TypeScript + Prisma. **SQLite for dev** (zero-install on Windows); switch to **PostgreSQL** for production (see DECISIONS.md).
- **Call provider:** CALL-E (`@call-e/calle` SDK, `https://api.heycall-e.com`) — AI agent that dials agents/landlords, runs a goal-driven conversation, and returns a structured result + transcript + confidence score. A **local mock provider** (`CALLE_MOCK=true`) simulates calls for development with switchable scenarios.
- **Package manager:** pnpm (workspace across `client` + `server`).
- **Deploy (2026-08-20):** Client on **Vercel** (Root Directory `client`, env `NEXT_PUBLIC_BACKEND_URL`). Server on **Render** (`render.yaml` blueprint, Node 22, `tsx` runtime). Both from the **same repo/monorepo** — Vercel and Render each build their package from the shared workspace and lockfile.

## System diagram

```diagram
[Next.js client]  (utils/call-api axios wrapper, credentials: include, React Query)
   │  /verify, /verify/[id], /login, /signup, /dashboard
   │  fetch() to backend API under /api/*
   ▼
[Backend service (Express + TS + Prisma)  :4000]
   ├── Auth (signup/login/logout/me — session cookie)
   ├── Verification requests (create, get, list)
   ├── URL parser (POST /verifications/parse — cheerio OG/JSON-LD) + manual fallback
   ├── CALL-E orchestrator (async create + webhook; real or mock)
   ├── Result engine (verdict, confidence, retry/attempts)
   └── DB (SQLite dev / Postgres prod: users, sessions, webhookEvents, verifications)
   │        ▲
   │        │ webhook (terminal result) POST /api/webhooks/calle
   ▼        │   (verified via CALL-E-Event-Id header + dedup table)
[ CALL-E API  https://api.heycall-e.com ]
   │  POST /v1/calls (task + result_schema + webhook_url)
   └─  returns: status, taskCompleted, completionConfidence,
      structuredResult, evidence, transcript
```

## End-to-end user flow

1. Landing page → "Verify a listing" → `/verify`
2. **Auth gate** — client-side `ProtectRoutes` redirects unauthenticated users to `/login?next=<original>`. Signup auto-logs-in.
3. **Submit** — paste URL → `POST /api/verifications/parse` → preview card → confirm. If parse fails → **manual form** (address, price, agent name, agent phone). Agent phone is normalized to E.164 via `libphonenumber-js`.
4. **Run** — `POST /api/verifications` stores the request (`pending`); the service creates a CALL-E call with `result_schema` = { isReal, isAvailable, priceMatches, photosAccurate, sizeMatches, amenitiesMatch, moveInDateConfirmed, scamSignals, notes } and `metadata` { verificationId, attempt }. Status flips to `calling`.
5. **Result** — CALL-E webhook → result engine → **Verified / Warning / Inconclusive** stored on the `Verification` (with retries when warranted). `/verify/[id]` polls and renders the report; dashboard history lists all.
6. **Post** — share report, report scam (future), landlord Verified badge (future).

## Backend structure (server/)

```
server/
├── .env.example          # DATABASE_URL, CALLE_*, CORS_ORIGINS, COOKIE_NAME, PORT, DEFAULT_PHONE_REGION
├── package.json
├── prisma/
│   ├── schema.sqlite.prisma      # dev schema (SQLite)
│   ├── migrations/               # SQLite migrations (dev)
│   └── postgresql/
│       ├── schema.prisma         # prod schema (PostgreSQL, DATABASE_URL)
│       └── migrations/           # Postgres migrations (deployed via prisma migrate deploy)
├── tsconfig.json
└── src/
    ├── index.ts              # Express bootstrap; mounts /api/health, /api/auth, /api/verifications, /api/webhooks
    ├── config/               # env.ts (zod-typed env), index.ts
    ├── lib/                  # prisma singleton, index.ts
    ├── middleware/           # auth.middleware.ts (requireAuth), cors.ts, verifyWebhook.ts, index.ts
    ├── routes/               # auth.routes.ts, verification.routes.ts, webhook.routes.ts, index.ts
    ├── controller/
    │   ├── auth/             # signup, login, logout (GET), index
    │   ├── verification/     # create, get, list, parse, serialize
    │   └── webhook/          # calleWebhook.controller.ts
    ├── schema/               # zod schemas: auth.schema.ts, verification.schema.ts
    ├── services/
    │   ├── auth.service.ts    # bcrypt hashing, session tokens, cookie
    │   ├── listing.service.ts # cheerio URL parser (OG tags + JSON-LD + title heuristics)
    │   ├── phone.service.ts   # libphonenumber-js E.164 normalization
    │   ├── calle.service.ts   # buildTask/buildResultSchema, Real + Mock providers
    │   ├── result.service.ts  # map structured result → verdict, retry decision
    │   └── verification.service.ts # orchestration: create, handleTerminalEvent, retries
    └── types/                # express.d.ts (req.user), result.ts (IVerificationResult, TerminalCall)
```

## Data model (Prisma) — implemented

```prisma
model User {
  id           String         @id @default(cuid())
  email        String         @unique
  passwordHash String
  sessions     Session[]
  verifications Verification[]
  createdAt    DateTime       @default(now())
}

model Session {
  token     String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model WebhookEvent {
  id        String   @id          // CALL-E event id (dedup guard)
  type      String
  createdAt DateTime @default(now())
}

model Verification {
  id               String    @id @default(cuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  source           String    // "url" | "manual"
  listingUrl       String?
  listingContext   String?   // JSON text: parsed listing { title, description }
  address          String
  price            Float?    // SQLite: Decimal unsupported; promote on Postgres
  agentName        String?
  agentPhone       String    // normalized E.164
  status           String    // "pending" | "calling" | "completed"
  result           String?   // "verified" | "warning" | "inconclusive"
  confidence       Float?
  calleCallId      String?
  structuredResult String?   // JSON text: { verdict, confidence, checks, summary, evidence, transcript }
  attempt          Int       @default(1)   // 1-2 (MAX_ATTEMPTS = 2)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([userId])
}
```

Note: SQLite lacks Prisma `Decimal`/`Json`, so `price` is `Float` and JSON columns are text. Promote to `Decimal`/`Json` on the Postgres migration.

## Auth

- **Signup/login** issue a session token stored in an **httpOnly, SameSite=Lax cookie** (`verify_session`). Logout is `GET /api/auth/logout` and clears the cookie.
- Passwords hashed with **bcryptjs** (10 rounds).
- Email verification **deferred** (on-page + dashboard notifications only in v1).
- `requireAuth` middleware reads the cookie and loads the session + user; `GET /api/auth/me` returns the current user. Client-side, `ProtectRoutes` gates routes and `SessionStore` (zustand) holds the session.

## API surface (all under /api)

| Method | Path                        | Auth  | Purpose                                       |
| ------ | --------------------------- | ----- | --------------------------------------------- |
| GET    | `/api/health`               | —     | Health check                                  |
| POST   | `/api/auth/signup`          | —     | Create account (auto-login, sets cookie)      |
| POST   | `/api/auth/login`           | —     | Set session cookie                            |
| GET    | `/api/auth/logout`          | ✓     | Clear session                                 |
| GET    | `/api/auth/me`              | ✓     | Current user                                  |
| POST   | `/api/verifications/parse`  | ✓     | Scrape a listing URL → preview                |
| POST   | `/api/verifications`        | ✓     | Submit (URL or manual) → returns id           |
| GET    | `/api/verifications/:id`    | ✓     | Get result + report (owner only)              |
| GET    | `/api/verifications`        | ✓     | History                                       |
| POST   | `/api/webhooks/calle`       | event | CALL-E terminal result (id header + dedup)    |

Responses follow `{ status: "success"|"error", message, data }`. Verification payloads are serialized via `serialize.ts` (parses `structuredResult` JSON).

## CALL-E integration (calle.service + verification.service)

Calls are created **asynchronously** with the webhook (`create` + `webhookUrl`), not `createAndWait`:

```ts
const call = await client.calls.create(
  {
    task,
    recipient: { phones: [phone], region, locale },
    recipientResultSchema: resultSchema,
    metadata: { verificationId, attempt },
    webhookUrl: env.CALLE_WEBHOOK_URL,
  },
  { idempotencyKey: `verify-${verificationId}-${attempt}` },
);
```

**Mock provider (`CALLE_MOCK=true`, default):** simulates a call and fires the terminal webhook locally after `CALLE_MOCK_DELAY_MS`. Scenarios: `verified` | `warning` | `inconclusive` | `no_answer` | `no_answer_then_verified`. `CALLE_MOCK_SCENARIO` selects it.

**Call task** — built in `buildTask` from the verification record; injects parsed listing context (`title`/`description`) when available so the agent can compare answers against the listing:

```ts
`Task: Call ${phone}${agent} on behalf of a prospective renter to verify the listing for ${address}${price}.

Goal: Confirm whether the listing is real, still available, correctly priced, accurately described (photos/size/amenities), and whether any scam signals are present.${listingDetails}

Rules:
- Open by identifying yourself as an independent listing-verification service calling on behalf of a prospective renter.
- Be polite, concise, and neutral — do not negotiate or sell.
- If there's no answer, hang up and retry once. If still no answer, mark the relevant fields "unknown". Never guess or invent answers.
- If the contact refuses to answer a question, mark it "unknown", not "no".
- Compare the contact's answers with the listing details above. If the contact states something that clearly contradicts the listing, mark the matching field "no".
- Fill every field of the result schema strictly from what was actually said in the conversation.

Return only the JSON result matching the provided schema.`
```

**Result schema** (`buildResultSchema`): object with required `isReal`, `isAvailable`, `priceMatches`, `photosAccurate`, `sizeMatches`, `amenitiesMatch`, `moveInDateConfirmed`, `scamSignals` (enum array: `deposit_before_tour`, `wire_only`, `owner_abroad`, `pressure_to_act_fast`, `no_in_person_viewing`, `none`), and `notes` (string). Every yes/no field accepts `"yes" | "no" | "unknown"`.

### Webhook handling

- `verifyWebhook` middleware requires the `CALL-E-Event-Id` header to match the body `id`, and dedupes events in the `WebhookEvent` table (returns `{ ok: true, duplicate: true }` for repeats).
- `handleTerminalEvent` maps the event (`mapTerminalCall`), finds the verification by `calleCallId` or `metadata.verificationId`, and:
  - **Non-completed event** (failed call, no answer) → retry if `attempt < MAX_ATTEMPTS` else finalize as inconclusive.
  - **Completed event** → compute verdict; if `inconclusive` and retry is warranted (`shouldRetry`), schedule another attempt; otherwise finalize.

### Result engine (result.service)

Verdict logic (does **not** require all fields `yes` — honest "I don't know" on secondary fields must not fail a listing):

| Condition                                                                    | Verdict       |
| ---------------------------------------------------------------------------- | ------------- |
| `isReal`, `isAvailable`, `priceMatches` all `yes`, no scam signals present   | **Verified**  |
| Any of `isReal`/`isAvailable`/`priceMatches` = `no`, or any scam signal      | **Warning**   |
| `unknown` / no usable conversation / low confidence on required checks       | Retry once → **Inconclusive** |

- `MAX_ATTEMPTS = 2`; `RETRY_CONFIDENCE_THRESHOLD = 0.5`.
- **Hybrid retry rule:** retry only on transient failure — no usable conversation (failed call / empty transcript) or `completionConfidence.score < 0.5`. If the recipient answered but just couldn't confirm, a second call won't help, so it finalizes as inconclusive.
- Secondary fields (`photosAccurate`, `sizeMatches`, `amenitiesMatch`, `moveInDateConfirmed`) may be `unknown` without affecting the verdict; they're shown in the report.
- Stored `structuredResult` JSON: `{ verdict, confidence, checks, summary, evidence, transcript }`.

## Frontend additions (client/) — implemented

- `/signup`, `/login` — auth pages (shared `AuthForm`, react-hook-form + zod).
- `/verify` — URL paste → parse preview → confirm, or manual form fallback.
- `/verify/[id]` — live status view (`InProgress`) while pending/calling, then `Report` (verdict badge, checks, red flags, call summary, notes, transcript).
- `/dashboard` — verification history list + cards.
- Data layer: `utils/call-api/` axios wrapper (`withCredentials`, env base URL, request/response interceptors), `api/auth.ts` + `api/verifications.ts`, React Query hooks in `hook/queries/`, zustand stores (`store/session.ts`, `store/auth.ts`), `components/protect.tsx` route guarding.
- Landing CTAs wired to real routes (`/verify`, `/login`) — the header "Verify a listing", hero, and final CTA all navigate to `/verify`.

## Phased build order — status

1. **Server skeleton** — Express + Prisma schema + migrate + auth routes ✅
2. **CALL-E integration** — calle.service + webhook + result engine (mock + real) ✅
3. **Verify flow** — submit URL/manual, polling status, result view ✅
4. **Client auth + dashboard** — signup/login pages, history ✅
5. **Polish + deploy config** — lint/typecheck config ✅, `render.yaml` blueprint ✅, Postgres schema + migrations ✅, Vercel (client) + Render (server) ✅. First deploy runs mock mode.

## Deploy (2026-08-20)

**One repo, two platforms** — both build from the same pnpm workspace and lockfile.

- **Client → Vercel:** import repo, Root Directory = `client`, env `NEXT_PUBLIC_BACKEND_URL=https://<server-domain>`. No code changes needed.
- **Server → Render:** `render.yaml` blueprint (`verify-api` web service, Node 22). Build runs `pnpm install --frozen-lockfile && prisma:generate:prod`; start runs `prisma:migrate:prod && start` (migrate applies Postgres migrations, then `tsx` serves the app). Health check on `/api/health`.
- **Database:** `DATABASE_URL` is a Postgres connection string (Render Postgres add-on or external Neon/Supabase). Dev stays on SQLite — two Prisma schemas live in `server/prisma/` (`schema.sqlite.prisma` dev, `postgresql/schema.prisma` prod), each with its own `migrations/` dir. Generate/migrate is per-schema via the `prisma:*` scripts.
- **Cookies:** client (Vercel) and server (Render) are cross-site, so prod sets `SameSite=None; Secure` (`auth.service.ts`) + exact-origin CORS (`CORS_ORIGINS=https://<client-domain>`). Local dev stays `SameSite=Lax` on `localhost`.
- **CALL-E:** `CALLE_MOCK=true` on first deploy (mock fires the webhook in-process). Flip to real by setting `CALLE_MOCK=false`, `CALLE_API_KEY`, `CALLE_WEBHOOK_URL=https://<server-domain>/api/webhooks/calle`, and a supported `CALLE_REGION`.

## Open items (non-blockers)

- **CALL-E region:** Nigeria (`NG`) **is supported** but routes via CALL-E **international lines** — primarily intended for testing; for production-grade local calls, contact CALL-E to enable a local line or set `CALLE_REGION` to a local-line country (US/SG/MY/IN/AE/AU/MX/BR). Real calls work today with `CALLE_MOCK=false` + API key. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the flip, and [HACKATHON.md](./HACKATHON.md) for the submission checklist.
- **Email deferred** — account notifications are on-page + dashboard only in v1.
- **URL parsing:** implemented as a generic cheerio scraper (Open Graph + JSON-LD + title heuristics) with manual fallback — works across sites without per-domain Playwright setups. Known-domain hardening can come later.
- **Post-deploy checks:** verify cookie flow on the real domain, add preview-branch client origins to `CORS_ORIGINS` as needed, and consider promoting `price` to `Decimal`/`structuredResult` to `Json` on Postgres once types matter.

## Security notes

- Secrets live in env vars; `.env*` is gitignored.
- Webhook endpoint verified via `CALL-E-Event-Id` header match + event-id dedup table.
- Verification endpoints are owner-scoped (`requireAuth` + `userId` filter on reads).
- bcryptjs for password hashing; httpOnly session cookie — `SameSite=None; Secure` in production (required cross-site between Vercel client and Render server), `SameSite=Lax` without `Secure` on localhost dev.