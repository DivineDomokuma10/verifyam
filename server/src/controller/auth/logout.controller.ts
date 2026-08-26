import type { Request, Response } from "express";

import { env } from "@/config";
import { deleteSession } from "@/services";
import { ok } from "@/utils";

const logoutController = async (req: Request, res: Response) => {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (typeof token === "string" && token) {
    await deleteSession(token);
  }

  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  });

  return ok(res, { message: "Logged out" });
};

export default logoutController;
