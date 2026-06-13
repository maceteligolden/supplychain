import { env } from "@/config/env";
import {
  createAppError,
  isAppError,
  normalizeError,
  type AppErrorInterface,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { API_ROUTES } from "@/config/api-routes";

type FetchJsonInput = {
  url: string;
  options?: RequestInit;
  skipRefresh?: boolean;
};

type ApiErrorBodyInterface = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

let refreshPromise: Promise<void> | null = null;

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (typeof window !== "undefined") {
    return path;
  }
  return `${env.appUrl}${path}`;
}

async function attemptTokenRefresh(
  cookieHeader: Record<string, string>,
): Promise<void> {
  if (refreshPromise) {
    await refreshPromise;
    return;
  }

  refreshPromise = (async (): Promise<void> => {
    const response = await fetch(resolveUrl(API_ROUTES.auth.refresh), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...cookieHeader,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw createAppError({
        code: "UNAUTHORIZED",
        message: "Session refresh failed",
        statusCode: 401,
      });
    }
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Shared fetch wrapper used by all services.
 * Normalizes errors and logs failures — UI must use this instead of raw fetch.
 */
export async function fetchJson<T>(input: FetchJsonInput): Promise<T> {
  const url = resolveUrl(input.url);
  const cookieHeader =
    typeof window === "undefined" && input.options?.headers
      ? (input.options.headers as Record<string, string>)
      : {};

  const executeFetch = async (): Promise<T> => {
    const isFormDataBody = input.options?.body instanceof FormData;

    const response = await fetch(url, {
      ...input.options,
      headers: {
        ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
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
  };

  try {
    return await executeFetch();
  } catch (error) {
    if (
      !input.skipRefresh &&
      isAppError(error) &&
      error.statusCode === 401 &&
      input.url !== API_ROUTES.auth.refresh &&
      input.url !== API_ROUTES.auth.login
    ) {
      try {
        await attemptTokenRefresh(cookieHeader);
        return executeFetch();
      } catch (refreshError) {
        if (isAppError(refreshError)) {
          throw refreshError;
        }
      }
    }

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
