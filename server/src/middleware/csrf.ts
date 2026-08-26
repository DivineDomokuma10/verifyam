import type { NextFunction, Request, Response } from "express";

import { env } from "@/config";

const trustedOrigins = new Set(env.CORS_ORIGINS);

const getRequestOrigin = (req: Request): string | null => {
  const origin = req.get("Origin");

  if (origin) return origin;

  const referer = req.get("Referer");

  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

export function requireTrustedOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = getRequestOrigin(req);

  if (!origin && env.NODE_ENV !== "production") {
    next();
    return;
  }

  if (origin && trustedOrigins.has(origin)) {
    next();
    return;
  }

  res.status(403).json({ status: "error", message: "Invalid request origin" });
}
