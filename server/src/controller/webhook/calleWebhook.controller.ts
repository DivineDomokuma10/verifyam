import type { Request, Response } from "express";

import type { WebhookEvent } from "@call-e/calle";

import { handleTerminalEvent } from "@/services";

const calleWebhookController = async (req: Request, res: Response) => {
  const event = req.body as WebhookEvent;

  try {
    await handleTerminalEvent(event);
  } catch (error) {
    console.error("CALL-E webhook processing failed:", error);
  }

  res.json({ ok: true });
};

export default calleWebhookController;