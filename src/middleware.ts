import { NextResponse, type NextRequest } from "next/server";

import { verifySessionTokenEdge } from "@/lib/auth/session.edge";
import { env } from "@/config/env";
import { PAGE_ROUTES } from "@/config/page-routes";
import { API_ROUTES } from "@/config/api-routes";

const PUBLIC_PAGE_PATHS = [PAGE_ROUTES.login] as const;

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGE_PATHS.some((path) => pathname === path);
}

function isPublicApiRoute(pathname: string, method: string): boolean {
  return pathname === API_ROUTES.auth.login && method === "POST";
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(env.sessionCookieName)?.value;
  if (!token) {
    return false;
  }
  const userId = await verifySessionTokenEdge(token);
  return userId !== null;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const authenticated = await isAuthenticated(request);

  if (isPublicApiRoute(pathname, request.method)) {
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    if (authenticated) {
      return NextResponse.redirect(new URL(PAGE_ROUTES.dashboard, request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
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
