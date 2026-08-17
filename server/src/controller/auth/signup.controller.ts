import type { Request, Response } from "express";

import { createSession, hashPassword, setSessionCookie } from "@/services";
import { prisma } from "@/lib";
import { credentialsSchema } from "@/schema";

const signupController = async (req: Request, res: Response) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });

  const token = await createSession(user.id);

  setSessionCookie(res, token);

  res.status(201).json({ id: user.id, email: user.email });
};

export default signupController;
