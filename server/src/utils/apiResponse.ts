import type { Response } from "express";
import type { z } from "zod";

import { AppError } from "./appError";

export interface OkOptions<T> {
  status?: number;
  message: string;
  data?: T;
}

export const ok = <T>(res: Response, options: OkOptions<T>): Response => {
  const { status = 200, message, data } = options;

  return res.status(status).json(
    data === undefined
      ? { status: "success", message }
      : { status: "success", message, data },
  );
};

export const fail = (res: Response, status: number, message: string): Response =>
  res.status(status).json({ status: "error", message });

const flattenFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
      Array.isArray(entry[1]),
    ),
  );
};

export function parseOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
  message = "Invalid request",
): z.infer<TSchema> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw AppError.badRequest(message, {
      details: flattenFieldErrors(parsed.error),
    });
  }

  return parsed.data;
}
