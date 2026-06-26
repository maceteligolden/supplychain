import { NextResponse, type NextRequest } from "next/server";

import { verifyAccessTokenEdge } from "@/lib/auth/access-token.edge";
import { verifySessionTokenEdge } from "@/lib/auth/session.edge";
import { env } from "@/config/env";
import { PAGE_ROUTES } from "@/config/page-routes";
import { API_ROUTES } from "@/config/api-routes";

const PUBLIC_PAGE_PATHS = [PAGE_ROUTES.login] as const;

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGE_PATHS.some((path) => pathname === path);
}

function isPublicApiRoute(pathname: string, method: string): boolean {
  if (pathname === API_ROUTES.auth.login && method === "POST") {
    return true;
  }
  if (pathname === API_ROUTES.auth.refresh && method === "POST") {
    return true;
  }
  return false;
}

async function hasValidAccessToken(request: NextRequest): Promise<boolean> {
  const accessToken = request.cookies.get(env.accessCookieName)?.value;
  if (!accessToken) {
    return false;
  }

  return (await verifyAccessTokenEdge(accessToken)) !== null;
}

async function isMockAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(env.sessionCookieName)?.value;
  if (!token) {
    return false;
  }
  const userId = await verifySessionTokenEdge(token);
  return userId !== null;
}

async function isBackendAuthenticated(request: NextRequest): Promise<boolean> {
  if (await hasValidAccessToken(request)) {
    return true;
  }

  const refreshToken = request.cookies.get(env.refreshCookieName)?.value;
  return Boolean(refreshToken);
}

async function shouldRedirectFromLoginPage(request: NextRequest): Promise<boolean> {
  if (env.useMockApi) {
    return isMockAuthenticated(request);
  }

  return hasValidAccessToken(request);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  if (env.useMockApi) {
    return isMockAuthenticated(request);
  }
  return isBackendAuthenticated(request);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const authenticated = await isAuthenticated(request);

  if (isPublicApiRoute(pathname, request.method)) {
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    const redirectFromLogin = await shouldRedirectFromLoginPage(request);
    if (redirectFromLogin) {
      return NextResponse.redirect(new URL(PAGE_ROUTES.dashboard, request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      // #region agent log
      fetch("http://127.0.0.1:7635/ingest/f1cde6f2-f277-47a6-90de-e69cad7d975b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "72dc51" },
        body: JSON.stringify({
          sessionId: "72dc51",
          hypothesisId: "C",
          location: "middleware.ts:api-401",
          message: "Middleware blocked API request",
          data: {
            pathname,
            method: request.method,
            useMockApi: env.useMockApi,
            hasAccessCookie: Boolean(request.cookies.get(env.accessCookieName)?.value),
            hasRefreshCookie: Boolean(
              request.cookies.get(env.refreshCookieName)?.value,
            ),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated" },
        { status: 401 },
      );
    }
    const loginUrl = new URL(PAGE_ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
