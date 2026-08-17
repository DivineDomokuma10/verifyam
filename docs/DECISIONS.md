# VERIFY — Decision Log

Record of product and technical decisions made during planning. Newest first.

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