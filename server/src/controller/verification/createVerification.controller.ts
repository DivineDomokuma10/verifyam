import type { Request, Response } from "express";

import { createVerificationSchema } from "@/schema";
import { createVerification, normalizePhone } from "@/services";
import { serializeVerification } from "./serialize";

const createVerificationController = async (req: Request, res: Response) => {
  const parsed = createVerificationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ status: "error", message: "Invalid verification data" });
    return;
  }

  let agentPhone: string;

  try {
    agentPhone = normalizePhone(parsed.data.agentPhone);
  } catch {
    res.status(400).json({ status: "error", message: "Invalid agent phone number" });
    return;
  }

  try {
    const verification = await createVerification(req.user!.id, {
      ...parsed.data,
      agentPhone,
    });

    res.status(201).json({
      status: "success",
      message: "Verification started",
      data: serializeVerification(verification),
    });
  } catch {
    res.status(502).json({
      status: "error",
      message: "Could not start the verification call. Please try again.",
    });
  }
};

export default createVerificationController;