import type { Request, Response } from "express";

import { prisma } from "@/lib";
import { AppError, ok } from "@/utils";
import { serializeVerification } from "./serialize";

const getVerificationController = async (req: Request, res: Response) => {
  const verification = await prisma.verification.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
  });

  if (!verification) {
    throw AppError.notFound("Verification not found");
  }

  return ok(res, {
    message: "Verification fetched",
    data: serializeVerification(verification),
  });
};

export default getVerificationController;
