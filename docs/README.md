# VERIFY

**Tagline:** Don't just find it. Verify it.

A property verification platform. Users paste a listing link (Zillow, Apartments.com, Facebook, Craigslist, or any site) and VERIFY calls the agent or landlord behind it to confirm the listing is **real, available, and accurate** before renters waste time or money.

## Product facts

- **AI is a tool, not the message** — the public copy centers on the verification outcome, not the technology.
- **Dual audience:** renters (verify a listing free) and landlords/agents (get a Verified badge, reduce stale leads).
- **Monetization:** free for renters; landlord badge is a future phase.
- **Turnaround:** 24-hour standard. Phone calls only — **no SMS follow-up**.
- **CALL-E** (`@call-e/calle` SDK) is the AI phone-call provider.

## Repo layout

```
start-up/verify/
├── client/          # Next.js 16 frontend (App Router, Tailwind v4, shadcn/ui)
├── docs/            # this documentation
└── server/          # Express + TypeScript + Prisma backend (SQLite dev / Postgres prod)
```

Root pnpm workspace (`pnpm-workspace.yaml`) spans `client` + `server`.

## Current status (2026-08-20)

Core product is built and runnable end-to-end: auth, listing parse + manual submit, verification flow against CALL-E (mock mode by default, `CALLE_MOCK=true`), verdict engine with retries, and the full client flow (`/verify`, `/verify/[id]`, `/login`, `/signup`, `/dashboard`). **Deploy config is in place** — client on Vercel, server on Render (`render.yaml`), Postgres via a prod-only Prisma schema; see the "Deploy" section in [ARCHITECTURE.md](./ARCHITECTURE.md). Remaining: flipping CALL-E to real calls, future-phase features (email, landlord badge, report-scam), and post-deploy smoke tests.

## Docs index

- [ARCHITECTURE.md](./ARCHITECTURE.md) — full system architecture, data model, API surface, CALL-E integration, phased build order
- [USER_FLOW.md](./USER_FLOW.md) — end-to-end user journey
- [DECISIONS.md](./DECISIONS.md) — recorded product/technical decisions with rationale
