import { createAppError, isAppError, toClientError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { mockDelay } from "@/mocks/delay";

type JsonResponseInput<T> = {
  data: T;
  status?: number;
  headers?: Record<string, string>;
};

export function jsonResponse<T>(input: JsonResponseInput<T>): Response {
  const headers = new Headers(input.headers);
  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(input.data), {
    status: input.status ?? 200,
    headers,
  });
}

type ErrorResponseInput = {
  error: unknown;
  fallbackMessage?: string;
};

export function errorResponse(input: ErrorResponseInput): Response {
  if (isAppError(input.error)) {
    return jsonResponse({
      data: toClientError(input.error),
      status: input.error.statusCode,
    });
  }

  logger.error(input.fallbackMessage ?? "Unhandled API error", {
    namespace: "api",
    meta: { error: input.error },
  });

  const appError = createAppError({
    code: "INTERNAL_ERROR",
    message: input.fallbackMessage ?? "Internal server error",
  });

  return jsonResponse({
    data: toClientError(appError),
    status: appError.statusCode,
  });
}

type WithMockDelayInput = {
  handler: () => Response | Promise<Response>;
};

/** Wraps a handler with optional mock network delay. */
export async function withMockDelay(input: WithMockDelayInput): Promise<Response> {
  await mockDelay();
  return input.handler();
}

/** Re-export proxy helper for route handlers. */
export { proxyRequest } from "@/lib/api/proxy-request";
