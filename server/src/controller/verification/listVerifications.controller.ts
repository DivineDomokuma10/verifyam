import type { Request, Response } from "express";

import { prisma } from "@/lib";
import { ok } from "@/utils";
import { serializeVerification } from "./serialize";

const listVerificationsController = async (req: Request, res: Response) => {
  const verifications = await prisma.verification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });

  return ok(res, {
    message: "Verifications fetched",
    data: verifications.map(serializeVerification),
  });
};

export default listVerificationsController;
