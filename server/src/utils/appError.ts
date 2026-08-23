export interface AppErrorOptions {
  cause?: unknown;
  details?: Record<string, string[]>;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational = true;
  readonly details?: Record<string, string[]>;

  constructor(statusCode: number, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });

    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = options.details;

    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message = "Bad request", options?: AppErrorOptions): AppError {
    return new AppError(400, message, options);
  }

  static unauthorized(message = "Unauthorized", options?: AppErrorOptions): AppError {
    return new AppError(401, message, options);
  }

  static forbidden(message = "Forbidden", options?: AppErrorOptions): AppError {
    return new AppError(403, message, options);
  }

  static notFound(message = "Resource not found", options?: AppErrorOptions): AppError {
    return new AppError(404, message, options);
  }

  static conflict(message = "Conflict", options?: AppErrorOptions): AppError {
    return new AppError(409, message, options);
  }

  static unprocessable(
    message = "Unprocessable content",
    options?: AppErrorOptions,
  ): AppError {
    return new AppError(422, message, options);
  }

  static tooManyRequests(
    message = "Too many requests",
    options?: AppErrorOptions,
  ): AppError {
    return new AppError(429, message, options);
  }

  static serviceUnavailable(
    message = "Service unavailable",
    options?: AppErrorOptions,
  ): AppError {
    return new AppError(502, message, options);
  }

  static internal(message = "Internal server error", options?: AppErrorOptions): AppError {
    return new AppError(500, message, options);
  }
}
