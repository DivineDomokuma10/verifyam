import type { Request, Response } from "express";

import { prisma } from "@/lib";
import { serializeVerification } from "./serialize";

const listVerificationsController = async (req: Request, res: Response) => {
  const verifications = await prisma.verification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    status: "success",
    message: "Verifications fetched",
    data: verifications.map(serializeVerification),
  });
};

export default listVerificationsController;