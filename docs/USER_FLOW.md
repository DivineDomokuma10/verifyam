# VERIFY — User Flow

## Decision: accounts-only, no anonymous flow

Every verification requires an account. There is no anonymous verification path. This eliminates lost-on-close results, token-expiry logic, and "re-link anonymous verification" complexity. History is always tracked per user.

## Account notifications (v1)

- **Email is deferred.** Account users are notified **on-page** and via their **dashboard history** in v1.
- When email is added later, account users will be notified **on email AND on-page**.

## End-to-end journey

### 1. Entry
- Landing page → CTA "Verify a listing" → `/verify`
- Secondary CTAs ("Get your listings verified", header CTA) also route to `/verify` for v1.

### 2. Auth gate
- `/verify` requires a session.
- Not signed in → redirected to `/login` (with `?next=/verify`).
- `/signup` → creates account → auto-login → continue to `/verify`.

### 3. Submit the listing
- **URL path:** paste a listing URL → backend parses → **preview card** (photo, price, address, agent/landlord) → user confirms "yes, this is it".
- **Manual fallback path:** when URL parse fails or the user prefers, a form collects: address, asking price, agent/landlord name, agent/landlord phone.
- On submit, a `Verification` is created with `status = pending`.

### 4. Verification runs (24h standard)
- Background task creates a CALL-E call against the agent/landlord phone.
- CALL-E plans, dials, holds a live conversation, and returns a structured result.
- **Phone calls only — no SMS follow-up.** No-answer triggers retry logic.
- The `/verify/[id]` page polls and shows live status: *pending → calling → completed*.

### 5. Result
- CALL-E webhook → result engine → verdict stored on the `Verification`.
- **Verdicts:** `Verified` / `Warning` / `Inconclusive`.
- **Report includes:** call summary, confidence score, red flags, and the answers to the three checks (real / available / accurate), plus transcript.
- On-page notification + saved to dashboard history.

### 6. Post-result
- Share the report (roommate, landlord, authorities if a scam).
- Report a scam (future).
- Landlord Verified badge program (future).

## States

| Status    | Meaning                                  |
| --------- | ---------------------------------------- |
| pending   | Submitted; queued for verification       |
| calling   | CALL-E call in progress / retrying       |
| completed | Verdict produced (verified/warning/inconclusive) |

## Wire-up changes on the client

- Replace anchor CTAs pointing at `#verify` with real routes (`/verify`, `/login`, `/signup`, `/dashboard`).
- Add `lib/api.ts` fetch wrapper using `credentials: "include"` for session cookies.
- Add the four new pages: `/verify`, `/verify/[id]`, `/login`, `/signup`, `/dashboard`.