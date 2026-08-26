import type { Request, Response } from "express";

import { Prisma } from "@prisma/client";
import type { WebhookEvent } from "@call-e/calle";

import { prisma } from "@/lib";
import { handleTerminalEvent } from "@/services";
import { AppError } from "@/utils";

const calleWebhookController = async (req: Request, res: Response) => {
  const event = req.body as WebhookEvent;
  const eventId = req.webhookEventId ?? event.id;

  try {
    await handleTerminalEvent(event);

    await prisma.webhookEvent.create({
      data: { id: eventId, type: event.type },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.json({ ok: true, duplicate: true });
      return;
    }

    console.error("CALL-E webhook processing failed:", error);
    throw AppError.serviceUnavailable("Webhook processing failed", { cause: error });
  }

  res.json({ ok: true });
};

export default calleWebhookController;
