import { env } from "@/config/env";
import {
  createAppError,
  isAppError,
  normalizeError,
  type AppErrorInterface,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

type FetchJsonInput = {
  url: string;
  options?: RequestInit;
};

type ApiErrorBodyInterface = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Browser: use same-origin relative paths so session cookies are sent and cleared correctly.
  if (typeof window !== "undefined") {
    return path;
  }
  return `${env.appUrl}${path}`;
}

/**
 * Shared fetch wrapper used by all services.
 * Normalizes errors and logs failures — UI must use this instead of raw fetch.
 */
export async function fetchJson<T>(input: FetchJsonInput): Promise<T> {
  const url = resolveUrl(input.url);

  try {
    const response = await fetch(url, {
      ...input.options,
      headers: {
        "Content-Type": "application/json",
        ...input.options?.headers,
      },
      credentials: "include",
    });

    const body: unknown = await response.json();

    if (!response.ok) {
      const errorBody = body as ApiErrorBodyInterface;
      throw createAppError({
        code: (errorBody.code as AppErrorInterface["code"]) ?? "UNKNOWN",
        message: errorBody.message ?? "Request failed",
        statusCode: response.status,
        details: errorBody.details,
      });
    }

    return body as T;
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    const normalized = normalizeError({
      error,
      fallbackMessage: "Network request failed",
    });
    logger.error(normalized.message, {
      namespace: "api-client",
      meta: { url },
    });
    throw normalized;
  }
}
