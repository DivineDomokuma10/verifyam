import type { Request, Response } from "express";

import { prisma } from "@/lib";
import { serializeVerification } from "./serialize";

const getVerificationController = async (req: Request, res: Response) => {
  const verification = await prisma.verification.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
  });

  if (!verification) {
    res.status(404).json({ status: "error", message: "Verification not found" });
    return;
  }

  res.json({
    status: "success",
    message: "Verification fetched",
    data: serializeVerification(verification),
  });
};

export default getVerificationController;