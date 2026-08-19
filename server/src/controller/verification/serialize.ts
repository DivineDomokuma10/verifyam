import type { Verification } from "@prisma/client";

interface VerificationResponse {
  id: string;
  source: string;
  listingUrl: string | null;
  address: string;
  price: number | null;
  agentName: string | null;
  agentPhone: string;
  status: string;
  result: string | null;
  confidence: number | null;
  attempt: number;
  createdAt: string;
  updatedAt: string;
  structuredResult: unknown;
}

export function serializeVerification(
  verification: Verification,
): VerificationResponse {
  let structuredResult: unknown = null;

  if (verification.structuredResult) {
    try {
      structuredResult = JSON.parse(verification.structuredResult);
    } catch {
      structuredResult = null;
    }
  }

  return {
    id: verification.id,
    source: verification.source,
    listingUrl: verification.listingUrl,
    address: verification.address,
    price: verification.price,
    agentName: verification.agentName,
    agentPhone: verification.agentPhone,
    status: verification.status,
    result: verification.result,
    confidence: verification.confidence,
    attempt: verification.attempt,
    createdAt: verification.createdAt.toISOString(),
    updatedAt: verification.updatedAt.toISOString(),
    structuredResult,
  };
}