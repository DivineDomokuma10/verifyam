import type { Request, Response } from "express";

import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from "@/services";
import { prisma } from "@/lib";
import { credentialsSchema } from "@/schema";

const loginController = async (req: Request, res: Response) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ status: "error", message: "Invalid email or password" });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ status: "error", message: "Invalid credentials" });
    return;
  }

  const token = await createSession(user.id);

  setSessionCookie(res, token);

  res.json({
    status: "success",
    message: "Login Successful",
    data: { id: user.id, email: user.email },
  });
};

export default loginController;
