export interface IUserResponse {
  id: string;
  email: string;
}

export interface IVerificationResultChecks {
  isReal: "yes" | "no" | "unknown";
  isAvailable: "yes" | "no" | "unknown";
  priceMatches: "yes" | "no" | "unknown";
  photosAccurate: "yes" | "no" | "unknown";
  sizeMatches: "yes" | "no" | "unknown";
  amenitiesMatch: "yes" | "no" | "unknown";
  moveInDateConfirmed: "yes" | "no" | "unknown";
  scamSignals: string[];
  notes: string;
}

export interface IVerificationStructuredResult {
  verdict: "verified" | "warning" | "inconclusive";
  confidence: number;
  checks: IVerificationResultChecks;
  summary: string | null;
  evidence: string[];
  transcript: Array<{ speaker: string; text: string }>;
}

export type TVerificationStatus = "pending" | "calling" | "completed";

export interface IVerificationResponse {
  id: string;
  source: "url" | "manual";
  listingUrl: string | null;
  address: string;
  price: number | null;
  agentName: string | null;
  agentPhone: string;
  status: TVerificationStatus;
  result: "verified" | "warning" | "inconclusive" | null;
  confidence: number | null;
  attempt: number;
  createdAt: string;
  updatedAt: string;
  structuredResult: IVerificationStructuredResult | null;
}

export interface IListingPreview {
  url: string;
  hostname: string;
  title: string | null;
  description: string | null;
  image: string | null;
}