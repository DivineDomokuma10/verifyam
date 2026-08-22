import { describe, expect, it } from "vitest";

import { buildResultSchema, buildTask, parseListingContext } from "./calle.service";

const verification = {
  id: "v1",
  userId: "u1",
  source: "manual",
  listingUrl: null,
  listingContext: null,
  address: "12 Marina View",
  price: 2500,
  agentName: "Jane",
  agentPhone: "+2348012345678",
  status: "pending",
  attempt: 1,
  calleCallId: null,
  result: null,
  confidence: null,
  structuredResult: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe("buildTask", () => {
  it("discloses that the call is an automated listing-verification service", () => {
    const task = buildTask(verification);

    expect(task).toMatch(/identifying yourself as an independent listing-verification service/i);
    expect(task).toContain("12 Marina View");
    expect(task).toContain("$2500/month");
  });

  it("instructs the agent to mark unknown instead of guessing", () => {
    const task = buildTask(verification);

    expect(task).toMatch(/never guess or invent answers/i);
    expect(task).toMatch(/mark it "unknown"/i);
  });
});

describe("parseListingContext", () => {
  it("returns null for invalid JSON", () => {
    expect(parseListingContext("{not json")).toBeNull();
  });

  it("returns null when no usable strings", () => {
    expect(parseListingContext(JSON.stringify({ title: "   " }))).toBeNull();
  });

  it("strips site-suffix patterns from the title", () => {
    const context = parseListingContext(
      JSON.stringify({
        title: "Sunny 2-bed apartment | Zillow",
        description: "Near the waterfront.",
      }),
    );

    expect(context).toBe("Sunny 2-bed apartment — Near the waterfront.");
  });

  it("returns null for empty input", () => {
    expect(parseListingContext(null)).toBeNull();
  });
});

describe("buildResultSchema", () => {
  it("requires all seven checks plus scam signals and notes", () => {
    const schema = buildResultSchema() as { required: string[] };

    expect(schema.required).toEqual([
      "isReal",
      "isAvailable",
      "priceMatches",
      "photosAccurate",
      "sizeMatches",
      "amenitiesMatch",
      "moveInDateConfirmed",
      "scamSignals",
      "notes",
    ]);
  });
});
