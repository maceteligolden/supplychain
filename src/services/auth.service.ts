import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthCookieHeader } from "@/services/auth-headers";
import type {
  GetCurrentUserOutput,
  LoginInput,
  LoginOutput,
  LogoutOutput,
  RefreshSessionOutput,
} from "@/types/user.interface";

/**
 * Authenticates a Super Admin via the auth API (mock or proxied backend).
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

/** Clears auth cookies via the logout API route. */
export async function logout(): Promise<void> {
  const cookieHeader = await getAuthCookieHeader();

  await fetchJson<LogoutOutput>({
    url: API_ROUTES.auth.logout,
    options: {
      method: "POST",
      headers: cookieHeader,
    },
  });
}

/** Returns the currently authenticated user from auth cookies. */
export async function getCurrentUser(): Promise<GetCurrentUserOutput> {
  const cookieHeader = await getAuthCookieHeader();

  return fetchJson<GetCurrentUserOutput>({
    url: API_ROUTES.auth.me,
    options: {
      method: "GET",
      cache: "no-store",
      headers: cookieHeader,
    },
  });
}

/** Rotates auth tokens using the refresh cookie. */
export async function refreshSession(): Promise<RefreshSessionOutput> {
  const cookieHeader = await getAuthCookieHeader();

  return fetchJson<RefreshSessionOutput>({
    url: API_ROUTES.auth.refresh,
    options: {
      method: "POST",
      headers: cookieHeader,
    },
  });
}
