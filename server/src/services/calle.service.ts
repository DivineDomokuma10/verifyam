import { randomUUID } from "node:crypto";

import { CalleClient, type JsonObject, type WebhookEvent } from "@call-e/calle";
import type { Verification } from "@prisma/client";

import { env } from "@/config";

export interface CalleCallInput {
  task: string;
  phone: string;
  resultSchema: JsonObject;
  metadata: { verificationId: string; attempt: number };
}

export interface CreatedCall {
  id: string;
}

export interface CalleProvider {
  createCall(input: CalleCallInput): Promise<CreatedCall>;
}

export function buildResultSchema(): JsonObject {
  const field = (name: string, description: string) => ({
    type: "string",
    enum: ["yes", "no", "unknown"],
    description,
  });

  return {
    type: "object",
    required: [
      "isReal",
      "isAvailable",
      "priceMatches",
      "photosAccurate",
      "sizeMatches",
      "amenitiesMatch",
      "moveInDateConfirmed",
      "scamSignals",
      "notes",
    ],
    properties: {
      isReal: field("isReal", "Whether the listing and the property itself actually exist."),
      isAvailable: field("isAvailable", "Whether the property is currently available to rent."),
      priceMatches: field("priceMatches", "Whether the advertised asking price matches what the contact quotes."),
      photosAccurate: field("photosAccurate", "Whether the photos match the actual unit."),
      sizeMatches: field("sizeMatches", "Whether the size/bedrooms/bathrooms match the listing."),
      amenitiesMatch: field("amenitiesMatch", "Whether the listed amenities exist."),
      moveInDateConfirmed: field("moveInDateConfirmed", "Whether the contact confirmed a move-in date."),
      scamSignals: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "deposit_before_tour",
            "wire_only",
            "owner_abroad",
            "pressure_to_act_fast",
            "no_in_person_viewing",
            "none",
          ],
        },
      },
      notes: { type: "string" },
    },
  };
}

export function buildTask(verification: Verification): string {
  const price = verification.price ? ` (listed at $${verification.price}/month)` : "";
  const agent = verification.agentName
    ? ` (${verification.agentName})`
    : "";

  const context = parseListingContext(verification.listingContext);

  const listingDetails = context
    ? `\n\nThe listing to verify against describes the property as follows: ${context}`
    : "\n\nNo written listing details were provided, so ask the contact to describe the unit and check the answers for consistency.";

  return `Task: Call ${verification.agentPhone}${agent} on behalf of a prospective renter to verify the listing for ${verification.address}${price}.

Goal: Confirm whether the listing is real, still available, correctly priced, accurately described (photos/size/amenities), and whether any scam signals are present.${listingDetails}

Rules:
- Open by identifying yourself as an independent listing-verification service calling on behalf of a prospective renter.
- Be polite, concise, and neutral — do not negotiate or sell.
- If there's no answer, hang up and retry once. If still no answer, mark the relevant fields "unknown". Never guess or invent answers.
- If the contact refuses to answer a question, mark it "unknown", not "no".
- Compare the contact's answers with the listing details above. If the contact states something that clearly contradicts the listing (wrong price, wrong size, missing amenities), mark the matching field "no".
- Fill every field of the result schema strictly from what was actually said in the conversation.

Return only the JSON result matching the provided schema.`;
}

const parseListingContext = (raw: string | null): string | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      title?: unknown;
      description?: unknown;
    };

    const title =
      typeof parsed.title === "string"
        ? parsed.title
            .replace(/\s*\|\s*[^|]+$/, "")
            .replace(/\s+[-–—]\s+[^-–—]+$/, "")
            .trim()
        : "";

    const parts = [title, parsed.description]
      .filter((value): value is string => typeof value === "string" && value.trim() !== "")
      .map((value) => value.trim());

    if (parts.length === 0) return null;

    return parts.join(" — ");
  } catch {
    return null;
  }
};

export function buildCallInput(verification: Verification, attempt: number): CalleCallInput {
  return {
    task: buildTask(verification),
    phone: verification.agentPhone,
    resultSchema: buildResultSchema(),
    metadata: { verificationId: verification.id, attempt },
  };
}

class RealCalleProvider implements CalleProvider {
  private client: CalleClient;

  constructor() {
    this.client = new CalleClient({
      apiKey: env.CALLE_API_KEY,
      baseUrl: env.CALLE_BASE_URL,
    });
  }

  async createCall(input: CalleCallInput): Promise<CreatedCall> {
    if (!env.CALLE_API_KEY) {
      throw new Error("CALLE_API_KEY is required when CALLE_MOCK is false");
    }

    const call = await this.client.calls.create(
      {
        task: input.task,
        recipient: {
          phones: [input.phone],
          region: env.CALLE_REGION,
          locale: env.CALLE_LOCALE,
        },
        recipientResultSchema: input.resultSchema,
        metadata: input.metadata,
        webhookUrl: env.CALLE_WEBHOOK_URL,
      },
      { idempotencyKey: `verify-${input.metadata.verificationId}-${input.metadata.attempt}` },
    );

    return { id: call.id };
  }
}

type TerminalHandler = (event: WebhookEvent) => void | Promise<void>;

const SCENARIOS = [
  "verified",
  "warning",
  "inconclusive",
  "no_answer",
  "no_answer_then_verified",
] as const;

type MockScenario = (typeof SCENARIOS)[number];

const toIso = (offsetSeconds: number): string =>
  new Date(Date.now() + offsetSeconds * 1000).toISOString();

function mockRecipientScenario(scenario: MockScenario, attempt: number) {
  const secondAttempt = attempt >= 2;

  if (scenario === "no_answer") {
    return { type: "failed" as const };
  }

  if (scenario === "no_answer_then_verified" && !secondAttempt) {
    return { type: "failed" as const };
  }

  if (scenario === "warning") {
    return {
      type: "completed" as const,
      result: {
        isReal: "yes",
        isAvailable: "no",
        priceMatches: "yes",
        photosAccurate: "unknown",
        sizeMatches: "unknown",
        amenitiesMatch: "unknown",
        moveInDateConfirmed: "unknown",
        scamSignals: ["none"],
        notes: "The agent said the unit has already been rented.",
      },
      confidence: 0.92,
    };
  }

  if (scenario === "inconclusive") {
    return {
      type: "completed" as const,
      result: {
        isReal: "unknown",
        isAvailable: "unknown",
        priceMatches: "unknown",
        photosAccurate: "unknown",
        sizeMatches: "unknown",
        amenitiesMatch: "unknown",
        moveInDateConfirmed: "unknown",
        scamSignals: [],
        notes: "The contact could not confirm the listing details.",
      },
      confidence: 0.4,
    };
  }

  return {
    type: "completed" as const,
    result: {
      isReal: "yes",
      isAvailable: "yes",
      priceMatches: "yes",
      photosAccurate: "yes",
      sizeMatches: "yes",
      amenitiesMatch: "yes",
      moveInDateConfirmed: "yes",
      scamSignals: ["none"],
      notes: "The agent confirmed the listing is real, available, and accurate.",
    },
    confidence: 0.95,
  };
}

function buildMockEvent(input: CalleCallInput, callId: string): WebhookEvent {
  const attempt = input.metadata.attempt;
  const scenario = (env.CALLE_MOCK_SCENARIO ?? "verified") as MockScenario;
  const outcome = mockRecipientScenario(scenario, attempt);

  const structuredResult =
    outcome.type === "completed" ? outcome.result : null;

  const transcriptTurns =
    outcome.type === "completed"
      ? [
          { offset_seconds: 0, speaker: "bot" as const, text: "Hi, I'm calling about the listing you have posted." },
          { offset_seconds: 6, speaker: "user" as const, text: "Sure, go ahead." },
        ]
      : [];

  const attemptStatus = outcome.type === "completed" ? "completed" : "failed";

  return {
    id: `evt_${randomUUID()}`,
    type: outcome.type === "completed" ? "call.completed" : "call.failed",
    created_at: toIso(0),
    data: {
      id: callId,
      object: "call_task",
      status: outcome.type === "completed" ? "completed" : "failed",
      task: input.task,
      recipients: [
        {
          id: `rcp_${randomUUID()}`,
          phones: [input.phone],
          locale: env.CALLE_LOCALE,
          region: env.CALLE_REGION,
          status: outcome.type === "completed" ? "completed" : "failed",
          structured_result: structuredResult,
          summary:
            outcome.type === "completed"
              ? "The contact provided usable answers."
              : "No usable answer was obtained.",
          attempts: [
            {
              id: `att_${randomUUID()}`,
              phone: input.phone,
              status: attemptStatus,
              started_at: toIso(-60),
              completed_at: toIso(0),
              summary: null,
              transcript_turns: transcriptTurns,
              provider_call_id: null,
              failure_code: outcome.type === "completed" ? null : "no_answer",
              failure_message: outcome.type === "completed" ? null : "No answer.",
            },
          ],
        },
      ],
      structured_result: null,
      summary:
        outcome.type === "completed"
          ? "The listing verification call completed."
          : "The call did not connect.",
      task_completed: outcome.type === "completed",
      completion_confidence: {
        score: outcome.type === "completed" ? outcome.confidence : 0.1,
        label: outcome.type === "completed" ? "high" : "low",
      },
      evidence:
        outcome.type === "completed"
          ? ["The contact provided usable answers to the verification checks."]
          : [],
      metadata: input.metadata,
      failure_code: outcome.type === "completed" ? null : "no_answer",
      failure_message: outcome.type === "completed" ? null : "No answer.",
      created_at: toIso(-120),
      completed_at: toIso(0),
    },
  };
}

class MockCalleProvider implements CalleProvider {
  constructor(private readonly onTerminal: TerminalHandler) {}

  async createCall(input: CalleCallInput): Promise<CreatedCall> {
    const id = `mock_${randomUUID()}`;
    const delayMs = env.CALLE_MOCK_DELAY_MS;

    setTimeout(() => {
      Promise.resolve(this.onTerminal(buildMockEvent(input, id))).catch((error) => {
        console.error("MockCalleProvider onTerminal failed:", error);
      });
    }, delayMs);

    return { id };
  }
}

export function createCalleProvider(onTerminal: TerminalHandler): CalleProvider {
  return env.CALLE_MOCK
    ? new MockCalleProvider(onTerminal)
    : new RealCalleProvider();
}