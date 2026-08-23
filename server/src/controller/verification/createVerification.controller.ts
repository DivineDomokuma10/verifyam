import type { Request, Response } from "express";

import { createVerificationSchema } from "@/schema";
import { createVerification, normalizePhone } from "@/services";
import { AppError, ok, parseOrThrow } from "@/utils";
import { serializeVerification } from "./serialize";

const createVerificationController = async (req: Request, res: Response) => {
  const input = parseOrThrow(
    createVerificationSchema,
    req.body,
    "Invalid verification data",
  );

  let agentPhone: string;

  try {
    agentPhone = normalizePhone(input.agentPhone);
  } catch (error) {
    throw AppError.badRequest("Invalid agent phone number", { cause: error });
  }

  try {
    const verification = await createVerification(req.user!.id, {
      ...input,
      agentPhone,
    });

    return ok(res, {
      status: 201,
      message: "Verification started",
      data: serializeVerification(verification),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw AppError.serviceUnavailable(
      "Could not start the verification call. Please try again.",
      { cause: error },
    );
  }
};

export default createVerificationController;
