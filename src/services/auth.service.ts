import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import type {
  GetCurrentUserOutput,
  LoginInput,
  LoginOutput,
  LogoutOutput,
} from "@/types/user.interface";

async function getServerCookieHeader(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    return {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get(env.sessionCookieName);

  if (!session) {
    return {};
  }

  return { Cookie: `${env.sessionCookieName}=${session.value}` };
}

/**
 * Authenticates a Super Admin via the mock auth API.
 * Swap-safe: only this service changes when real MongoDB auth is connected.
 */
export async function login(input: LoginInput): Promise<LoginOutput> {
  return fetchJson<LoginOutput>({
    url: API_ROUTES.auth.login,
    options: {
      method: "POST",
      body: JSON.stringify(input),
    },
  });
}

/** Clears the session cookie via the logout API route. */
export async function logout(): Promise<void> {
  const cookieHeader = await getServerCookieHeader();

  await fetchJson<LogoutOutput>({
    url: API_ROUTES.auth.logout,
    options: {
      method: "POST",
      headers: cookieHeader,
    },
  });
}

/** Returns the currently authenticated user from the session cookie. */
export async function getCurrentUser(): Promise<GetCurrentUserOutput> {
  const cookieHeader = await getServerCookieHeader();

  return fetchJson<GetCurrentUserOutput>({
    url: API_ROUTES.auth.me,
    options: {
      method: "GET",
      cache: "no-store",
      headers: cookieHeader,
    },
  });
}
