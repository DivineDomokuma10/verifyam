import type { NextFunction, Request, Response } from "express";

import { env } from "@/config";
import { prisma } from "@/lib";

/**
 * In-memory sliding-window limiter keyed by user id. Resets on server
 * restart — sufficient for single-instance deployments; swap for a shared
 * store (e.g. Redis) when running multiple instances.
 */
const hourlyHits = new Map<string, number[]>();

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export async function createVerificationRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ status: "error", message: "Not authenticated" });
    return;
  }

  const now = Date.now();
  const hits = (hourlyHits.get(userId) ?? []).filter(
    (timestamp) => now - timestamp < HOUR_MS,
  );

  if (hits.length >= env.MAX_VERIFICATIONS_PER_HOUR) {
    res.status(429).json({
      status: "error",
      message:
        "Too many verification requests. Please wait a while before submitting again.",
    });
    return;
  }

  const createdToday = await prisma.verification.count({
    where: { userId, createdAt: { gte: startOfDay() } },
  });

  if (createdToday >= env.MAX_VERIFICATIONS_PER_DAY) {
    res.status(429).json({
      status: "error",
      message: `Daily limit of ${env.MAX_VERIFICATIONS_PER_DAY} verifications reached. Try again tomorrow.`,
    });
    return;
  }

  hourlyHits.set(userId, [...hits, now]);
  next();
}
