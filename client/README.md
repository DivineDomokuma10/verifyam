# VERIFY — Client

Next.js 16 frontend (App Router, React 19, Tailwind v4, shadcn/ui) for the
VERIFY property-listing verification platform.

## Setup

```bash
# from the repo root (pnpm workspace)
pnpm install

# environment
cp .env.example .env.local   # then set NEXT_PUBLIC_BACKEND_URL
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the API server (e.g. `http://localhost:4000`) |

## Run

```bash
pnpm dev        # from repo root, or: pnpm --filter @verify/client dev
```

Open http://localhost:3000. Routes: `/` landing, `/signup`, `/login`,
`/verify` (submit a listing), `/verify/[id]` (live status + report),
`/dashboard` (history).

## Notes

- The API server lives in [`../server`](../server) — see its README for the
  CALL-E integration, mock mode (`CALLE_MOCK=true`), and credential handling.
- Architecture and deployment docs are in [`../docs`](../docs).
- Verdicts shown in reports are transcript-backed assessments of the call —
  not independent verification of a listing or a landlord's authority.
