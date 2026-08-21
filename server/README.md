# Server — VERIFY Verification Service

**Express + TypeScript + Prisma backend** for the VERIFY property verification platform.

---

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Environment variables:** Copy `.env` (or create one) and set the following:

   ```env
   DATABASE_URL="file:./dev.db"
   PORT=4000
   NODE_ENV="development"
   COOKIE_NAME="verify_session"
   SESSION_TTL_DAYS=30
   CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

   CALLE_API_KEY="iams_live_...your-api-key..."
   CALLE_BASE_URL="https://api.heycall-e.com"
   CALLE_WEBHOOK_URL="http://localhost:4000/api/webhooks/calle"
   CALLE_MOCK="true"          # set to "false" for real calls
   CALLE_MOCK_SCENARIO="verified"  # scenarios: verified | warning | inconclusive | no_answer | no_answer_then_verified
   CALLE_REGION="NG"
   CALLE_LOCALE="en-NG"
   DEFAULT_PHONE_REGION="NG"
   ```

3. **Database:** The repo uses SQLite in development (`prisma/schema.sqlite.prisma`). Run:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate dev
   ```

4. **Start the server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   Server runs at `http://localhost:4000`.

---

## Usage

The server exposes REST endpoints and webhooks for the verification flow:

- **`POST /api/verifications`** — Create a new verification (starts call flow)
- **`GET /api/verifications`** — List verifications for the authenticated user
- **`GET /api/verifications/:id`** — Get a specific verification result
- **`POST /api/webhooks/calle`** — CALL-E webhook endpoint (receives call completion events)

The CALL-E integration follows this workflow:

1. Client submits a listing (URL or manual form)
2. Server creates a verification record with `status = pending`
3. Server creates a CALL-E call via `client.calls.create()` with a verification task
4. CALL-E dials the agent/landlord, holds a live conversation, and returns a structured result
5. Webhook `call.completed` triggers the result engine (`computeVerdict`)
6. Verdict (`Verified`/`Warning`/`Inconclusive`) is stored with transcript evidence

---

## Supported Hosts / Providers

- **Primary provider:** `@call-e/calle` SDK
- **Two provider modes:**
  - **Mock mode** (default): `CALLE_MOCK=true` — uses `MockCalleProvider` with 5 predefined scenarios (`verified`, `warning`, `inconclusive`, `no_answer`, `no_answer_then_verified`). Zero-cost development/testing.
  - **Real mode**: `CALLE_MOCK=false` — requires `CALLE_API_KEY` and uses `RealCalleProvider` to make actual phone calls via the CALL-E API.
- **Supported regions:** `NG` (Nigeria) is configured; CALL-E supports additional regions with local numbers: `US`, `SG`, `MY`, `IN`, `AE`, `AU`, `MX`, `BR` (set `CALLE_REGION` + `CALLE_LOCALE` accordingly).

**Outbound-call disclosure** (embedded in the call task, `server/src/services/calle.service.ts:82-84`):

> "Open by identifying yourself as an independent listing-verification service calling on behalf of a prospective renter.
> - Be polite, concise, and neutral — do not negotiate or sell.
> - If there's no answer, hang up and retry once. If still no answer, mark the relevant fields "unknown". Never guess or invent answers.
> - If the contact refuses to answer a question, mark it "unknown", not "no".
> - Compare the contact's answers with the listing details. If the contact states something that clearly contradicts the listing (wrong price, wrong size, missing amenities), mark the matching field "no".
> - Fill every field of the result schema strictly from what was actually said in the conversation."

---

## Credential Handling

- **API key:** `CALLE_API_KEY` stored in `.env` — **never committed to source control** (listed in `.gitignore`).
- **Real mode requirement:** When `CALLE_MOCK=false`, the server throws `Error: CALLE_API_KEY is required when CALLE_MOCK is false` if the key is missing.
- **Webhook authentication:** Deliveries are unsigned; dedup relies on the `CALL-E-Event-Id` header matching the body `id`. The `verifyWebhook` middleware records events in the `WebhookEvent` table for at-least-once deduplication.
- **Phone numbers:** Normalized to E.164 format using `libphonenumber-js`. Users must provide phone numbers they own or are authorized to call.

---

## Mock / No-Call Path

- **Enable mock mode:** Set `CALLE_MOCK="true"` (default in development `.env`).
- **Mock scenarios** (configured via `CALLE_MOCK_SCENARIO`):
  - `verified` — Agent confirms listing is real, available, and accurate
  - `warning` — Agent says unit already rented (isAvailable = "no")
  - `inconclusive` — Agent could not confirm listing details
  - `no_answer` — Call failed, no retry
  - `no_answer_then_verified` — No answer on first attempt, verified on second
- **Switch to real calls:** Set `CALLE_MOCK=false`, provide `CALLE_API_KEY`, and deploy with proper webhook URL.
- **No-call path:** If the agent/landlord does not answer, the call is retried once. If still no answer, fields are marked `"unknown"` and the verdict defaults to `inconclusive` (or `warning` if scam signals are present).

---

## Verification Verdict Logic

Verdicts are determined by the `computeVerdict` function in `server/src/services/result.service.ts`:

| Condition | Verdict |
| --- | --- |
| `isReal`, `isAvailable`, `priceMatches` all `"yes"` and no scam signals | `Verified` |
| Any core field `"no"` OR scam signals present | `Warning` |
| Otherwise | `Inconclusive` |

**Important:** Verdicts are **schema-validated transcript-supported assessments**, not independent authority verification of the listing. The transcript is stored as evidence and available on the report page, but the verdict algorithm uses the structured result fields (`isReal`, `isAvailable`, `priceMatches`, etc.), not transcript content analysis.

---

## Project Structure

```
server/
├── src/
│   ├── controller/      # API routes
│   ├── controller/verification/  # verification CRUD
│   ├── middleware/      # CORS, auth, cors
│   ├── prisma/          # Prisma client & migrations
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   │   ├── calle.service.ts       # CALL-E integration (mock + real)
│   │   ├── result.service.ts      # Verdict engine (computeVerdict)
│   │   ├── verification.service.ts # Verification lifecycle
│   │   └── result.service.ts      # Result mapping & helpers
│   ├── schema/          # Zod validation schemas
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.sqlite.prisma   # SQLite dev schema
│   └── postgresql/            # Prod Prisma schema
├── .env                     # Environment variables (gitignored)
├── render.yaml              # Render deploy configuration
└── package.json
```