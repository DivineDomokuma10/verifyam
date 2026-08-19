export type TResultField = "yes" | "no" | "unknown";

export type TVerdict = "verified" | "warning" | "inconclusive";

export interface IVerificationResult {
  isReal: TResultField;
  isAvailable: TResultField;
  priceMatches: TResultField;
  photosAccurate: TResultField;
  sizeMatches: TResultField;
  amenitiesMatch: TResultField;
  moveInDateConfirmed: TResultField;
  scamSignals: string[];
  notes: string;
}

export interface TerminalAttempt {
  status: string;
  transcriptTurns: Array<{ offsetSeconds: number | null; speaker: string; text: string }>;
}

export interface TerminalRecipient {
  status: string;
  structuredResult: Record<string, unknown> | null;
  attempts: TerminalAttempt[];
}

export interface TerminalCall {
  id: string;
  status: string;
  summary: string | null;
  evidence: string[];
  metadata: Record<string, unknown>;
  structuredResult: Record<string, unknown> | null;
  completionConfidence: { score: number; label: string } | null;
  recipients: TerminalRecipient[];
}