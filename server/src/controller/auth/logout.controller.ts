import type { Request, Response } from "express";

import { env } from "@/config";
import { deleteSession } from "@/services";
import { ok } from "@/utils";

const logoutController = async (req: Request, res: Response) => {
  const token = req.cookies?.[env.COOKIE_NAME] as string;

  await deleteSession(token);

  res.clearCookie(env.COOKIE_NAME, { path: "/" });

  return ok(res, { message: "Logged out" });
};

export default logoutController;
