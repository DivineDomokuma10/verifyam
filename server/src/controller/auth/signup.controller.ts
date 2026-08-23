import type { Request, Response } from "express";

import { createSession, hashPassword, setSessionCookie } from "@/services";
import { prisma } from "@/lib";
import { credentialsSchema } from "@/schema";
import { AppError, ok, parseOrThrow } from "@/utils";

const signupController = async (req: Request, res: Response) => {
  const { email, password } = parseOrThrow(
    credentialsSchema,
    req.body,
    "Invalid email or password",
  );

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw AppError.conflict("Email already registered");
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });

  const token = await createSession(user.id);

  setSessionCookie(res, token);

  return ok(res, {
    status: 201,
    message: "Signup Successful",
    data: { id: user.id, email: user.email },
  });
};

export default signupController;
