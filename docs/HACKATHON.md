# VERIFY — CALL-E Hackathon Submission

Targets **CALL-E: Your Code Is Calling** (`https://call-e.devpost.com`).
Deadline: **September 14, 2026** (11:45pm SGT). Judging: Sep 30 – Oct 13, 2026.

This file is the compliance checklist for the [official rules](https://call-e.devpost.com/rules),
plus the draft materials you'll paste into the Devpost submission form.

---

## Rules → status

| Rule | Status |
| ---- | ------ |
| Functional app using CALL-E API/SDK (TypeScript) | ✅ `@call-e/calle` SDK — `client.calls.create` + webhook, real + mock providers |
| CALL-E **actually called at runtime** (judging criterion) | ⚠️ Code is ready; live demo must run with `CALLE_MOCK=false` + API key (see [DEPLOYMENT.md](./DEPLOYMENT.md#flip-to-real-calls)) |
| Project newly created / significantly updated during submission period (Jul 23 – Sep 14) | ✅ First commit Aug 14, 2026; active since |
| Open a PR to `CALLE-AI/awesome-phone-call-agents` (mandatory) | ❌ Drafted below — open via your GitHub |
| Demo video < 3 min, public YouTube/Vimeo | ❌ Create (your side) |
| Text description of features/functionality | 📝 Draft below |
| Provide the email of your CALL-E account | ❌ Your side |
| Optional: live demo URL | ⚠️ After deploy (see [DEPLOYMENT.md](./DEPLOYMENT.md)) |
| Testing access for judges (website link, or credentials if private) | ⚠️ After deploy; public Vercel link suffices |
| No Sponsor financial/preferential support | ✅ None |
| Original work, no third-party IP in video/music | ✅ / verify in video |

---

## Judging criteria alignment (how VERIFY scores)

- **Real World Impact** — real phone-work problem (rental-listing fraud / stale listings), credible for real users; renters waste weekends + deposits, landlords get dead leads. Clear "build this further" direction (landlord badge, report-scam).
- **Quality of the Idea** — non-obvious CALL-E use: an AI *auditor* that calls the person behind a listing and maps answers to a verdict, not a generic "AI makes calls" wrapper. Reusable result schema + retry/verdict engine.
- **Technical Implementation** — full-stack app, structured result schema (7 checks + scam signals), async create + webhook, idempotency-keyed calls, event-id dedup, hybrid retry rule, owner-scoped API, E.164 normalization.
- **Product Experience & Demo** — complete UX (landing → auth → submit → live status → report with checks, red flags, transcript). Demo video must walk this end-to-end.

---

## PR to awesome-phone-call-agents (mandatory)

Contribution area: **User-facing Apps** (`### Apps` bullet list in the README, external links allowed — e.g. CallmeMaybe, SchemaRelay).

### 1. Push this repo to GitHub first

The PR links to your public repo, so:

```bash
git remote add origin https://github.com/<YOUR_GITHUB>/verify.git
git push -u origin main
```

Also open the repo on GitHub → Settings → Pages or leave it (the README entry only needs the repo URL).

### 2. Fork and edit

1. Fork `https://github.com/CALLE-AI/awesome-phone-call-agents`.
2. In `README.md`, under **### Apps**, add one bullet (keep the [template](https://github.com/CALLE-AI/awesome-phone-call-agents/blob/main/README.md) — short, specific, workflow-tied):

```markdown
- [VERIFY](https://github.com/<YOUR_GITHUB>/verify) - Disclosed listing-verification app that calls the agent or landlord behind a rental ad and returns a schema-validated Verified/Warning/Inconclusive verdict with transcript evidence and an optional mock mode.
```

3. Run the repo's validator before opening the PR (from a Python 3 env):

```bash
python3 scripts/validate_repository.py
```

### 3. PR metadata

- **Branch:** `docs/verify-listing-app` (see `docs/git-naming-conventions.md`).
- **Title:** `docs: add VERIFY listing-verification app` (see same file for conventions).
- **Body:** brief description (app purpose, CALL-E SDK usage, mock mode, link to repo).

> Option (stronger contribution): also add a small runnable sample under `apps/typescript/verify-listing/` following the app template (README with setup/side-effects/cancellation/credentials/dry-run notes). Not required, but it makes the PR a code contribution instead of a list entry.

---

## Devpost submission form — draft text

- **Project name:** VERIFY — Don't just find it. Verify it.
- **Tagline:** We call the agent or landlord behind every listing and confirm it's real, available, and accurate.
- **Description (concise):**

> VERIFY is a property-listing verification platform. Renters paste a listing URL (Zillow, Apartments.com, Facebook, Craigslist, or any site) or enter the details manually; VERIFY's CALL-E integration calls the agent or landlord, runs a goal-driven conversation against a 7-check result schema (real, available, price matches, photos accurate, size matches, amenities match, move-in date) plus scam-signal detection, and returns a **Verified / Warning / Inconclusive** verdict with a confidence score and full transcript.
>
> The backend is Express + TypeScript + Prisma with async CALL-E call creation + terminal webhooks (event-id deduplicated), an idempotency-keyed provider client, a mock provider for zero-cost development/testing (5 scenarios), and a hybrid retry rule (max 2 attempts, retry only on transient failure). The client is Next.js 16 (App Router, React 19, Tailwind v4) with signup/login, a live status page, and a dashboard history.
>
> Built for the CALL-E hackathon: TypeScript SDK (`@call-e/calle`) actually called at runtime via `client.calls.create` with a structured `recipientResultSchema`; terminal results delivered to `POST /api/webhooks/calle`.

- **Demo video:** < 3 min walkthrough — landing → signup → paste a listing → preview → submit → live status → completed report (checks, red flags, transcript). Upload to YouTube/Vimeo as **public/unlisted**; paste the link.
- **CALL-E account email:** (your CALL-E signup email)
- **PR URL:** (paste the PR you opened in the section above)
- **Optional demo URL:** `https://<your-client>.vercel.app` (after deploy)
- **Build details:** pnpm monorepo; `client` + `server`; run instructions in the repo README.

---

## Additional prizes / notes

- **Most Valuable Feedback ($200 + credits):** during the Feedback Period (Jul 23 – Sep 18), complete the CALL-E feedback survey at `https://call-e.devpost.com/details/feedback` (one per entrant, actionable). Do this — it's cheap and separate from the project prize.
- **Multiple prizes:** a project can win only one prize; a feedback prize is separate and per individual.
- **Team eligibility:** above age of majority; Nigeria is an allowed region (only US- or local-law-sanctioned places are excluded). If a team, appoint one Representative who submits.

---

## Pre-deadline checklist

- [ ] Push repo to GitHub
- [ ] Deploy Render + Vercel (see [DEPLOYMENT.md](./DEPLOYMENT.md)) with real CALL-E (or mock, if time)
- [ ] Open PR to awesome-phone-call-agents
- [ ] Record + upload < 3 min demo video
- [ ] Fill Devpost form (description, PR URL, CALL-E email, demo URL)
- [ ] Submit before Sep 14, 2026 11:45pm SGT