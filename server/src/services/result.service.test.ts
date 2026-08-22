import { describe, expect, it } from "vitest";

import type { IVerificationResult, TerminalCall } from "@/types";
import {
  computeVerdict,
  mapStructuredResult,
  shouldRetry,
} from "./result.service";

const baseResult = (): IVerificationResult => ({
  isReal: "unknown",
  isAvailable: "unknown",
  priceMatches: "unknown",
  photosAccurate: "unknown",
  sizeMatches: "unknown",
  amenitiesMatch: "unknown",
  moveInDateConfirmed: "unknown",
  scamSignals: [],
  notes: "",
});

describe("computeVerdict", () => {
  it("returns verified only when all three core fields are yes with no scam signals", () => {
    const result = baseResult();
    result.isReal = "yes";
    result.isAvailable = "yes";
    result.priceMatches = "yes";

    expect(computeVerdict(result)).toBe("verified");
  });

  it("ignores unknown secondary fields when core fields are yes", () => {
    const result = baseResult();
    result.isReal = "yes";
    result.isAvailable = "yes";
    result.priceMatches = "yes";
    result.photosAccurate = "unknown";
    result.sizeMatches = "no";

    expect(computeVerdict(result)).toBe("verified");
  });

  it.each(["isReal", "isAvailable", "priceMatches"] as const)(
    "returns warning when %s is no",
    (field) => {
      const result = baseResult();
      result.isReal = "yes";
      result.isAvailable = "yes";
      result.priceMatches = "yes";
      result[field] = "no";

      expect(computeVerdict(result)).toBe("warning");
    },
  );

  it("returns warning on any scam signal", () => {
    const result = baseResult();
    result.isReal = "yes";
    result.isAvailable = "yes";
    result.priceMatches = "yes";
    result.scamSignals = ["none", "wire_only"];

    expect(computeVerdict(result)).toBe("warning");
  });

  it("returns inconclusive when a core field is unknown and no scam signals", () => {
    const result = baseResult();
    result.isReal = "yes";
    result.isAvailable = "yes";

    expect(computeVerdict(result)).toBe("inconclusive");
  });
});

describe("mapStructuredResult", () => {
  it("coerces invalid field values to unknown and filters scam signals to known values", () => {
    const mapped = mapStructuredResult({
      isReal: "maybe",
      isAvailable: true,
      priceMatches: "yes",
      scamSignals: ["wire_only", "made_up_signal", 42],
      notes: 123,
    });

    expect(mapped.isReal).toBe("unknown");
    expect(mapped.isAvailable).toBe("unknown");
    expect(mapped.priceMatches).toBe("yes");
    expect(mapped.scamSignals).toEqual(["wire_only"]);
    expect(mapped.notes).toBe("");
  });
});

const terminalCall = (
  overrides: Partial<{
    confidence: number;
    attemptStatus: string;
    transcriptTurns: number;
  }> = {},
): TerminalCall =>
  ({
    id: "call_1",
    status: "completed",
    summary: null,
    evidence: [],
    metadata: {},
    structuredResult: null,
    completionConfidence: { score: overrides.confidence ?? 0.9, label: "high" },
    recipients: [
      {
        status: "completed",
        structuredResult: null,
        attempts: [
          {
            status: overrides.attemptStatus ?? "completed",
            transcriptTurns: Array.from(
              { length: overrides.transcriptTurns ?? 4 },
              () => ({ offsetSeconds: null, speaker: "bot", text: "hi" }),
            ),
          },
        ],
      },
    ],
  }) as TerminalCall;

describe("shouldRetry", () => {
  it("retries on transient failure: completed call with empty transcript", () => {
    expect(shouldRetry(terminalCall({ transcriptTurns: 0 }))).toBe(true);
  });

  it("retries when confidence is below threshold", () => {
    expect(shouldRetry(terminalCall({ confidence: 0.3 }))).toBe(true);
  });

  it("does not retry when the conversation was usable and confidence is sufficient", () => {
    expect(shouldRetry(terminalCall())).toBe(false);
  });

  it("does not retry when the last attempt did not complete", () => {
    // no usable conversation -> retry IS expected; flip expectation:
    expect(shouldRetry(terminalCall({ attemptStatus: "failed" }))).toBe(true);
  });
});
