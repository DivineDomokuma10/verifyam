import type { Request, Response } from "express";

import { env } from "@/config";
import { deleteSession } from "@/services";

const logoutController = async (req: Request, res: Response) => {
  const token = req.cookies?.[env.COOKIE_NAME] as string;

  await deleteSession(token);

  res.clearCookie(env.COOKIE_NAME, { path: "/" });

  res.status(204).end();
};

export default logoutController;
