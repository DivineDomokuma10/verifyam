import type { Verification } from "@prisma/client";
import type { WebhookEvent } from "@call-e/calle";

import { prisma } from "@/lib";
import type { IVerificationResult, TerminalCall, TVerdict } from "@/types";
import {
  buildCallInput,
  createCalleProvider,
  type CalleProvider,
} from "./calle.service";
import {
  MAX_ATTEMPTS,
  computeVerdict,
  getCallConfidence,
  getRecipientResult,
  mapTerminalCall,
  shouldRetry,
} from "./result.service";

export interface CreateVerificationInput {
  source: "url" | "manual";
  listingUrl?: string;
  listingContext?: string;
  address: string;
  price?: number;
  agentName?: string;
  agentPhone: string;
}

interface StoredResult {
  verdict: TVerdict;
  confidence: number;
  checks: IVerificationResult;
  summary: string | null;
  evidence: string[];
  transcript: Array<{ speaker: string; text: string }>;
}

let provider: CalleProvider | null = null;

const getProvider = (): CalleProvider => {
  if (!provider) {
    provider = createCalleProvider(handleTerminalEvent);
  }
  return provider;
};

const findVerification = async (
  event: WebhookEvent,
): Promise<Verification | null> => {
  // Primary path: the event must reference a call ID this server created.
  const byCallId = await prisma.verification.findFirst({
    where: { calleCallId: event.data.id },
  });

  if (byCallId) return byCallId;

  // Fallback: metadata binding is only trusted before the provider call
  // exists (calleCallId still null). Once set, an event whose id does not
  // match the stored call id is rejected — forged events cannot finalize
  // a verification by guessing the verificationId alone.
  const verificationId = event.data.metadata?.verificationId;

  if (typeof verificationId === "string") {
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
    });

    if (verification && !verification.calleCallId) return verification;
  }

  return null;
};

const buildStoredResult = (
  call: TerminalCall | null,
  verdict: TVerdict,
  checks: IVerificationResult,
): StoredResult => {
  const transcript =
    call?.recipients[0]?.attempts.flatMap((attempt) =>
      attempt.transcriptTurns.map((turn) => ({
        speaker: turn.speaker,
        text: turn.text,
      })),
    ) ?? [];

  return {
    verdict,
    confidence: call ? getCallConfidence(call) : 0,
    checks,
    summary: call?.summary ?? null,
    evidence: call?.evidence ?? [],
    transcript,
  };
};

const finalize = async (
  verification: Verification,
  verdict: TVerdict,
  checks: IVerificationResult,
  call: TerminalCall | null,
): Promise<void> => {
  await prisma.verification.update({
    where: { id: verification.id },
    data: {
      status: "completed",
      result: verdict,
      confidence: call ? getCallConfidence(call) : 0,
      structuredResult: JSON.stringify(
        buildStoredResult(call, verdict, checks),
      ),
    },
  });
};

const scheduleRetry = async (verification: Verification): Promise<void> => {
  const nextAttempt = verification.attempt + 1;

  const call = await getProvider().createCall(
    buildCallInput(verification, nextAttempt),
  );

  await prisma.verification.update({
    where: { id: verification.id },
    data: { attempt: nextAttempt, calleCallId: call.id, status: "calling" },
  });
};

const buildFallbackChecks = (notes: string): IVerificationResult => ({
  isReal: "unknown",
  isAvailable: "unknown",
  priceMatches: "unknown",
  photosAccurate: "unknown",
  sizeMatches: "unknown",
  amenitiesMatch: "unknown",
  moveInDateConfirmed: "unknown",
  scamSignals: [],
  notes,
});

const finalizeAsInconclusive = async (
  verification: Verification,
  call: TerminalCall | null,
  notes = "No usable information was obtained from the call.",
): Promise<void> => {
  const checks = call
    ? (getRecipientResult(call) ?? buildFallbackChecks(notes))
    : buildFallbackChecks(notes);

  await finalize(verification, "inconclusive", checks, call);
};

export async function createVerification(
  userId: string,
  input: CreateVerificationInput,
): Promise<Verification> {
  const verification = await prisma.verification.create({
    data: {
      userId,
      source: input.source,
      listingUrl: input.listingUrl,
      listingContext: input.listingContext ?? null,
      address: input.address,
      price: input.price,
      agentName: input.agentName,
      agentPhone: input.agentPhone,
      status: "pending",
      attempt: 1,
    },
  });

  try {
    const call = await getProvider().createCall(
      buildCallInput(verification, 1),
    );

    return prisma.verification.update({
      where: { id: verification.id },
      data: { status: "calling", calleCallId: call.id },
    });
  } catch (error) {
    await prisma.verification.delete({ where: { id: verification.id } });
    throw error;
  }
}

export async function handleTerminalEvent(event: WebhookEvent): Promise<void> {
  const verification = await findVerification(event);

  if (!verification || verification.status === "completed") {
    return;
  }

  try {
    const call = mapTerminalCall(event.data);

    if (event.type !== "call.completed") {
      if (verification.attempt < MAX_ATTEMPTS) {
        await scheduleRetry(verification);
      } else {
        await finalizeAsInconclusive(verification, call);
      }
      return;
    }

    const checks = getRecipientResult(call);
    const verdict = checks ? computeVerdict(checks) : "inconclusive";

    if (
      verdict === "inconclusive" &&
      verification.attempt < MAX_ATTEMPTS &&
      shouldRetry(call)
    ) {
      await scheduleRetry(verification);
      return;
    }

    if (verdict === "inconclusive") {
      await finalizeAsInconclusive(verification, call);
      return;
    }

    await finalize(verification, verdict, checks!, call);
  } catch (error) {
    console.error("Terminal event processing failed:", error);

    await finalizeAsInconclusive(
      verification,
      null,
      "The verification could not be completed due to an internal error.",
    );
  }
}
