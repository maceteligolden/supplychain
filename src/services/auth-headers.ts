import { env } from "@/config/env";

/**
 * Builds Cookie header for server-side auth API calls.
 */
export async function getAuthCookieHeader(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    return {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const cookieNames = env.useMockApi
    ? [env.sessionCookieName]
    : [env.accessCookieName, env.refreshCookieName];

  const cookieParts = cookieNames
    .map((cookieName) => {
      const cookieValue = cookieStore.get(cookieName)?.value;
      return cookieValue ? `${cookieName}=${cookieValue}` : null;
    })
    .filter((value): value is string => value !== null);

  if (cookieParts.length === 0) {
    return {};
  }

  return { Cookie: cookieParts.join("; ") };
}

/** Alias kept for existing services. */
export const getAuthHeaders = getAuthCookieHeader;
