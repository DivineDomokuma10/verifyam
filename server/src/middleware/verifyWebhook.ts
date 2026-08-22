import type { NextFunction, Request, Response } from "express";

import { env } from "@/config";
import { prisma } from "@/lib";

export async function verifyWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const body = req.body as { id?: unknown; type?: unknown } | undefined;

  if (!body || typeof body.id !== "string" || !body.id) {
    res.status(400).json({ status: "error", message: "invalid event" });
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

  await prisma.webhookEvent.create({
    data: { id: body.id, type: typeof body.type === "string" ? body.type : "" },
  });

  next();
}