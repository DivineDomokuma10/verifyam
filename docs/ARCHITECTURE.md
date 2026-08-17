# VERIFY — Architecture Plan (v1)

## Stack

- **Client:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui (base-luma) — already built (landing page).
- **Server:** Express + TypeScript + Prisma. **SQLite for dev** (zero-install on Windows); switch to **PostgreSQL** for production (see DECISIONS.md).
- **Call provider:** CALL-E (`@call-e/calle` SDK, `https://api.heycall-e.com`) — AI agent that dials agents/landlords, runs a goal-driven conversation, and returns a structured result + transcript + confidence score.
- **Package manager:** pnpm (workspace across `client` + `server`).

## System diagram

```diagram
[Next.js client]
   │  /verify, /signup, /login, /dashboard (history)
   │  fetch() to backend API (cookies: include)
   ▼
[Backend service (Express + TS + Prisma)]
   ├── Auth (signup/login/session cookie)
   ├── Verification requests (create, get, list)
   ├── URL parser (scrape listing → preview card) + manual fallback
   ├── CALL-E orchestrator (create call, webhook)
   ├── Result engine (structured result → Verified/Warning/Inconclusive)
   └── DB (SQLite dev / Postgres prod: users, sessions, verifications)
   │        ▲
   │        │ webhook (terminal result)
   ▼        │
[CALL-E API  https://api.heycall-e.com]
   │  POST /v1/calls (task + result_schema) → AI dials agent/landlord
   └─  returns: status, taskCompleted, completionConfidence,
      structuredResult, evidence, transcript
```

## End-to-end user flow

1. Landing page → "Verify a listing" → `/verify`
2. **Auth gate** — must sign up / log in (`/signup`, `/login`). Session cookie persists.
3. **Submit** — paste URL → backend parses → preview card → confirm. If parse fails → **manual form** (address, price, agent name, agent phone).
4. **Run** — verification stored (`pending`); background task creates a CALL-E call with `result_schema` = { isReal, isAvailable, isAccurate, notes }.
5. **Result** — CALL-E webhook → result engine → **Verified / Warning / Inconclusive** saved to DB. On-page notification + dashboard history.
6. **Post** — share report, report scam (future), landlord Verified badge (future).

## Backend structure (server/)

```
server/
├── .env.example          # DATABASE_URL, CALLE_API_KEY, JWT/session secret, WEBHOOK_TOKEN
├── package.json
├── prisma/schema.prisma  # data model
├── tsconfig.json
└── src/
    ├── index.ts              # Express bootstrap
    ├── config/env.ts         # typed env loading
    ├── middleware/auth.ts    # session cookie verification
    ├── routes/
    │   ├── auth.routes.ts    # signup, login, logout, me
    │   ├── verify.routes.ts  # create, get, list
    │   └── webhooks.routes.ts # CALL-E terminal result
    └── services/
        ├── auth.service.ts    # bcrypt hashing, session tokens
        ├── listing.service.ts # URL parse + manual fallback
        ├── calle.service.ts   # create call, poll, map webhook
        └── result.service.ts  # structured result → verdict + confidence
```

## Data model (Prisma)

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  sessions      Session[]
  verifications Verification[]
  createdAt     DateTime       @default(now())
}

model Session {
  token     String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Verification {
  id               String    @id @default(cuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  source           String    // "url" | "manual"
  listingUrl       String?
  address          String
  price            Float?    // SQLite: Decimal unsupported; promote on Postgres
  agentName        String?
  agentPhone       String
  status           String    // "pending" | "calling" | "completed"
  result           String?   // "verified" | "warning" | "inconclusive"
  confidence       Float?
  calleCallId      String?
  structuredResult String?   // SQLite: Json unsupported; JSON text, promote on Postgres
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([userId])
}
```

## Auth

- **Signup/login** issue a session token stored in an **httpOnly cookie**.
- Passwords hashed with **bcrypt**.
- Email verification **deferred** (on-page + dashboard notifications only in v1).
- `GET /auth/me` for session checks; a `requireAuth` middleware protects `/verifications`.

## API surface

| Method | Path                 | Auth  | Purpose                             |
| ------ | -------------------- | ----- | ----------------------------------- |
| POST   | `/auth/signup`       | —     | Create account                      |
| POST   | `/auth/login`        | —     | Set session cookie                  |
| POST   | `/auth/logout`       | ✓     | Clear session                       |
| GET    | `/auth/me`           | ✓     | Current user                        |
| POST   | `/verifications`     | ✓     | Submit (URL or manual) → returns id |
| GET    | `/verifications/:id` | ✓     | Get result + report (owner only)    |
| GET    | `/verifications`     | ✓     | History                             |
| POST   | `/webhooks/calle`    | token | CALL-E terminal result              |

## CALL-E integration (calle.service)

```ts
import { CalleClient } from "@call-e/calle";

const client = new CalleClient({ apiKey: process.env.CALLE_API_KEY! });

// Asynchronous path (recommended): create + webhook
// POST /v1/calls with webhook_url set; terminal result arrives at /webhooks/calle
```

**Call task** (used for a single verification). Prompt uses the goal + outcomes + no-answer-rule style so the agent fills every schema field and never fabricates:

```ts
const task = `Task: Call ${agentPhone} on behalf of a prospective renter to verify the listing for ${address} (listed at ${price}/month).

Goal: Confirm whether the listing is real, still available, correctly priced, accurately described (photos/size/amenities), and whether any scam signals are present.

Rules:
- Open by identifying yourself as an independent listing-verification service calling on behalf of a prospective renter.
- Be polite, concise, and neutral — do not negotiate or sell.
- If there's no answer, hang up and retry once. If still no answer, mark the relevant fields "unknown". Never guess or invent answers.
- If the contact refuses to answer a question, mark it "unknown", not "no".
- Fill every field of the result schema strictly from what was actually said in the conversation.

Return only the JSON result matching the provided schema.`;

const call = await client.calls.createAndWait({
  task,
  resultSchema: {
    type: "object",
    required: [
      "isReal", "isAvailable", "priceMatches", "photosAccurate",
      "sizeMatches", "amenitiesMatch", "moveInDateConfirmed", "scamSignals", "notes",
    ],
    properties: {
      isReal:              { type: "string", enum: ["yes", "no", "unknown"] },
      isAvailable:         { type: "string", enum: ["yes", "no", "unknown"] },
      priceMatches:        { type: "string", enum: ["yes", "no", "unknown"] },
      photosAccurate:      { type: "string", enum: ["yes", "no", "unknown"] },
      sizeMatches:         { type: "string", enum: ["yes", "no", "unknown"] },
      amenitiesMatch:      { type: "string", enum: ["yes", "no", "unknown"] },
      moveInDateConfirmed: { type: "string", enum: ["yes", "no", "unknown"] },
      scamSignals: {
        type: "array",
        items: { type: "string", enum: [
          "deposit_before_tour", "wire_only", "owner_abroad",
          "pressure_to_act_fast", "no_in_person_viewing", "none",
        ] },
      },
      notes: { type: "string" },
    },
  },
});
```

### Result engine (result.service)

The verdict does **not** require all fields `yes` — honest "I don't know" answers (size, amenities, move-in date) must not fail a listing.

| Condition                                                                    | Verdict       |
| ---------------------------------------------------------------------------- | ------------- |
| `isReal`, `isAvailable`, `priceMatches` all `yes`, `scamSignals` = `["none"]` or empty, confidence acceptable | **Verified**  |
| Any required check `no` (already rented, price mismatch, photos inaccurate) or any `scamSignals` present | **Warning**   |
| `unknown` / no answer / low confidence on required checks                    | Retry once → **Inconclusive** |

Secondary fields (`photosAccurate`, `sizeMatches`, `amenitiesMatch`, `moveInDateConfirmed`) may be `unknown` without affecting the verdict, but are shown in the report.

## Frontend additions (client/)

- `/signup`, `/login` — auth pages
- `/verify` — URL paste → parse preview → confirm → manual fallback form
- `/verify/[id]` — result/report view (call summary, confidence, red flags, transcript)
- `/dashboard` — verification history
- `lib/api.ts` — typed fetch wrapper with `credentials: "include"`
- Wire nav + CTAs to real routes (replacing `#verify` anchors)

## Phased build order

1. **Server skeleton** — Express + Prisma schema + migrate + auth routes
2. **CALL-E integration** — calle.service + webhook + result engine
3. **Verify flow** — submit URL/manual, polling status, result view
4. **Client auth + dashboard** — signup/login pages, history
5. **Polish + deploy config**

## Open items (non-blockers)

- **CALL-E region:** Nigeria is "International" (test-only until a local line is enabled). US/SG/MY/IN/AE/AU are local-ready. Confirm target market.
- **Email** deferred — account notifications are on-page + dashboard only in v1.
- **URL parsing** scope for v1: manual form as primary; Playwright scraping for known domains as enhancement.

## Security notes

- Store secrets in env vars, never commit (`.env*` is gitignored).
- Webhook endpoint protected by a shared internal token.
- Only verification owners can read their results.
- bcrypt for password hashing; httpOnly, `SameSite` cookies for sessions.
