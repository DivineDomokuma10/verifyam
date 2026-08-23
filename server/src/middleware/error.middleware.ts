import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "@/utils";
import { fail } from "@/utils/apiResponse";

export const notFoundHandler = (req: Request, res: Response): void => {
  fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;

    return AppError.badRequest("Invalid request", {
      cause: error,
      details: Object.fromEntries(
        Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
          Array.isArray(entry[1]),
        ),
      ),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return AppError.notFound("Resource not found", { cause: error });
    }

    if (error.code === "P2002") {
      return AppError.conflict("Resource already exists", { cause: error });
    }
  }

  return AppError.internal("Something went wrong. Please try again.", {
    cause: error,
  });
};

export function globalErrorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const appError = toAppError(error);

  if (appError.statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, appError.cause ?? appError);
  }

  res.status(appError.statusCode).json({
    status: "error",
    message: appError.message,
    ...(appError.details ? { errors: appError.details } : {}),
  });
}
