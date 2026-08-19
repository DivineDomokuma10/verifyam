import type { NextFunction, Request, Response } from "express";

import { env } from "@/config";
import { prisma } from "@/lib";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (!token) {
    res.status(401).json({ status: "error", message: "Not authenticated" });
    return;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ status: "error", message: "Session expired" });
    return;
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
  };

  next();
}
