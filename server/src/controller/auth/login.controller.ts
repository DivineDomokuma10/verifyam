import type { Request, Response } from "express";

import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from "@/services";
import { prisma } from "@/lib";
import { credentialsSchema } from "@/schema";
import { AppError, ok, parseOrThrow } from "@/utils";

const loginController = async (req: Request, res: Response) => {
  const { email, password } = parseOrThrow(
    credentialsSchema,
    req.body,
    "Invalid email or password",
  );

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw AppError.unauthorized("Invalid credentials");
  }

  const token = await createSession(user.id);

  setSessionCookie(res, token);

  return ok(res, {
    message: "Login Successful",
    data: { id: user.id, email: user.email },
  });
};

export default loginController;
