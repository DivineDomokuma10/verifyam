import type { NextFunction, Request, Response } from "express";

import { env } from "@/config";
import { prisma } from "@/lib";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNullableRecord = (value: unknown): boolean =>
  value === null || isRecord(value);

const isTranscriptTurn = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    (typeof value.offset_seconds === "number" || value.offset_seconds === null) &&
    typeof value.speaker === "string" &&
    typeof value.text === "string"
  );
};

const isAttempt = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    typeof value.status === "string" &&
    Array.isArray(value.transcript_turns) &&
    value.transcript_turns.every(isTranscriptTurn)
  );
};

const isRecipient = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    typeof value.status === "string" &&
    isNullableRecord(value.structured_result) &&
    Array.isArray(value.attempts) &&
    value.attempts.every(isAttempt)
  );
};

const hasValidEventShape = (body: Record<string, unknown>): boolean => {
  const data = body.data;
  const confidence = isRecord(data) ? data.completion_confidence : null;

  return (
    typeof body.type === "string" &&
    isRecord(data) &&
    typeof data.id === "string" &&
    typeof data.status === "string" &&
    isRecord(data.metadata) &&
    isNullableRecord(data.structured_result) &&
    (confidence === null ||
      (isRecord(confidence) && typeof confidence.score === "number")) &&
    Array.isArray(data.evidence) &&
    data.evidence.every((item) => typeof item === "string") &&
    Array.isArray(data.recipients) &&
    data.recipients.every(isRecipient)
  );
};

export async function verifyWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const body = req.body as Record<string, unknown> | undefined;

  if (!body || typeof body.id !== "string" || !body.id) {
    res.status(400).json({ status: "error", message: "invalid event" });
    return;
  }

  if (!hasValidEventShape(body)) {
    res.status(400).json({ status: "error", message: "invalid event shape" });
    return;
  }

  const eventIdHeader = req.get("CALL-E-Event-Id");

  if (!eventIdHeader || eventIdHeader !== body.id) {
    res.status(400).json({ status: "error", message: "invalid event id" });
    return;
  }

  if (env.CALLE_WEBHOOK_SECRET) {
    const signature = req.get("CALL-E-Signature");

    if (signature !== env.CALLE_WEBHOOK_SECRET) {
      res.status(401).json({ status: "error", message: "invalid signature" });
      return;
    }
  }

  const alreadySeen = await prisma.webhookEvent.findUnique({
    where: { id: body.id },
  });

  if (alreadySeen) {
    res.json({ ok: true, duplicate: true });
    return;
  }

  req.webhookEventId = body.id;

  next();
}
