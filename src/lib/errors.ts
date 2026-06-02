import { logger } from "@/lib/logger";

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR"
  | "UNKNOWN";

export interface AppErrorInterface extends Error {
  /** Machine-readable error code for client handling. */
  code: AppErrorCode;
  /** HTTP status code to return when surfaced via API routes. */
  statusCode: number;
  /** Optional structured details safe to expose to clients. */
  details?: Record<string, unknown>;
}

type CreateAppErrorInput = {
  code: AppErrorCode;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
};

type CreateAppErrorOutput = AppErrorInterface;

export function createAppError(input: CreateAppErrorInput): CreateAppErrorOutput {
  const error = new Error(input.message) as AppErrorInterface;
  error.name = "AppError";
  error.code = input.code;
  error.statusCode = input.statusCode ?? mapCodeToStatus(input.code);
  error.details = input.details;

  if (input.cause !== undefined) {
    error.cause = input.cause;
  }

  logger.error(input.message, {
    namespace: "errors",
    meta: { code: input.code, statusCode: error.statusCode, details: input.details },
  });

  return error;
}

function mapCodeToStatus(code: AppErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "NOT_FOUND":
      return 404;
    case "INTERNAL_ERROR":
    case "UNKNOWN":
    default:
      return 500;
  }
}

export function isAppError(error: unknown): error is AppErrorInterface {
  return (
    error instanceof Error &&
    "code" in error &&
    "statusCode" in error &&
    typeof (error as AppErrorInterface).code === "string"
  );
}

type NormalizeErrorInput = {
  error: unknown;
  fallbackMessage?: string;
};

type NormalizeErrorOutput = AppErrorInterface;

export function normalizeError(input: NormalizeErrorInput): NormalizeErrorOutput {
  if (isAppError(input.error)) {
    return input.error;
  }

  if (input.error instanceof Error) {
    return createAppError({
      code: "INTERNAL_ERROR",
      message: input.error.message,
      cause: input.error,
    });
  }

  return createAppError({
    code: "UNKNOWN",
    message: input.fallbackMessage ?? "An unexpected error occurred",
    cause: input.error,
  });
}

type ToClientErrorOutput = {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export function toClientError(error: AppErrorInterface): ToClientErrorOutput {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
  };
}
