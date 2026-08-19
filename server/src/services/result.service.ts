import type { WebhookEvent } from "@call-e/calle";

import type {
  IVerificationResult,
  TResultField,
  TVerdict,
  TerminalCall,
} from "@/types";

export const MAX_ATTEMPTS = 2;
export const RETRY_CONFIDENCE_THRESHOLD = 0.5;

type CallTask = WebhookEvent["data"];

const SCAM_SIGNALS = [
  "deposit_before_tour",
  "wire_only",
  "owner_abroad",
  "pressure_to_act_fast",
  "no_in_person_viewing",
  "none",
];

const toResultField = (value: unknown): TResultField =>
  value === "yes" || value === "no" || value === "unknown" ? value : "unknown";

const toScamSignals = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string =>
      typeof item === "string" && SCAM_SIGNALS.includes(item),
  );
};

export function mapStructuredResult(
  value: Record<string, unknown>,
): IVerificationResult {
  const signals = toScamSignals(value.scamSignals);

  return {
    isReal: toResultField(value.isReal),
    isAvailable: toResultField(value.isAvailable),
    priceMatches: toResultField(value.priceMatches),
    photosAccurate: toResultField(value.photosAccurate),
    sizeMatches: toResultField(value.sizeMatches),
    amenitiesMatch: toResultField(value.amenitiesMatch),
    moveInDateConfirmed: toResultField(value.moveInDateConfirmed),
    scamSignals: signals,
    notes: typeof value.notes === "string" ? value.notes : "",
  };
}

export function computeVerdict(result: IVerificationResult): TVerdict {
  const core = [result.isReal, result.isAvailable, result.priceMatches];
  const hasScamSignal = result.scamSignals.some((signal) => signal !== "none");

  if (core.some((field) => field === "no") || hasScamSignal) {
    return "warning";
  }

  if (core.every((field) => field === "yes")) {
    return "verified";
  }

  return "inconclusive";
}

export function getRecipientResult(
  call: TerminalCall,
): IVerificationResult | null {
  const recipient = call.recipients[0];
  const source = recipient?.structuredResult ?? call.structuredResult;

  if (!source || typeof source !== "object") {
    return null;
  }

  return mapStructuredResult(source);
}

export function getCallConfidence(call: TerminalCall): number {
  return call.completionConfidence?.score ?? 0;
}

export function hadUsableConversation(call: TerminalCall): boolean {
  const recipient = call.recipients[0];
  const lastAttempt = recipient?.attempts.at(-1);

  if (!recipient || !lastAttempt) {
    return false;
  }

  return (
    lastAttempt.status === "completed" && lastAttempt.transcriptTurns.length > 0
  );
}

/**
 * Hybrid retry rule: retry only when the first attempt never yielded usable
 * information (no answer, failed call, empty transcript, or very low
 * confidence). If the recipient actually answered but couldn't confirm, a
 * second call is unlikely to change the outcome, so we finalize instead.
 */
export function shouldRetry(call: TerminalCall): boolean {
  const confidence = getCallConfidence(call);

  const transientFailure =
    !hadUsableConversation(call) || confidence < RETRY_CONFIDENCE_THRESHOLD;

  return transientFailure;
}

export function mapTerminalCall(data: CallTask): TerminalCall {
  return {
    id: data.id,
    status: data.status,
    summary: data.summary,
    evidence: data.evidence,
    metadata: data.metadata,
    structuredResult: data.structured_result,
    completionConfidence: data.completion_confidence,
    recipients: data.recipients.map((recipient) => ({
      status: recipient.status,
      structuredResult: recipient.structured_result,
      attempts: recipient.attempts.map((attempt) => ({
        status: attempt.status,
        transcriptTurns: attempt.transcript_turns.map((turn) => ({
          offsetSeconds: turn.offset_seconds,
          speaker: turn.speaker,
          text: turn.text,
        })),
      })),
    })),
  };
}
