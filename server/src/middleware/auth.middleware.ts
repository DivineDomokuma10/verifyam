import type { NextFunction, Request, Response } from "express";

import { env } from "@/config";
import { prisma } from "@/lib";
import { AppError } from "@/utils";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (!token) {
    throw AppError.unauthorized("Not authenticated");
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw AppError.unauthorized("Session expired");
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
  };

  next();
}
