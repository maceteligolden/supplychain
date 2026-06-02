import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/config/env";
import {
  decodeSessionPayload,
  encodeSessionPayload,
  isSessionExpired,
  parseSessionToken,
} from "@/lib/auth/session-payload";

function signPayload(encoded: string): string {
  return createHmac("sha256", env.sessionSecret).update(encoded).digest("base64url");
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Creates a signed session token for the given user (Node.js runtime). */
export function createSessionToken(userId: string): string {
  const expiresAt = new Date(
    Date.now() + env.sessionMaxAgeSeconds * 1000,
  ).toISOString();

  const encoded = encodeSessionPayload({ userId, expiresAt });
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
}

/** Verifies a session token and returns the userId if valid (Node.js runtime). */
export function verifySessionToken(token: string): string | null {
  const parts = parseSessionToken(token);
  if (!parts) {
    return null;
  }

  const expectedSignature = signPayload(parts.encoded);
  if (!safeCompare(parts.signature, expectedSignature)) {
    return null;
  }

  const payload = decodeSessionPayload(parts.encoded);
  if (!payload || isSessionExpired(payload.expiresAt)) {
    return null;
  }

  return payload.userId;
}

/** Builds a Set-Cookie header value for a new session. */
export function buildSessionCookie(token: string): string {
  return serializeCookie(env.sessionCookieName, token, env.sessionMaxAgeSeconds);
}

/** Builds a Set-Cookie header value that clears the session. */
export function buildClearSessionCookie(): string {
  return serializeCookie(env.sessionCookieName, "", 0, true);
}

/** Reads the session token from a Request cookie header. */
export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const prefix = `${env.sessionCookieName}=`;

  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return cookie.slice(prefix.length);
    }
  }

  return null;
}

/** Resolves the authenticated userId from a Request, or null if unauthenticated. */
export function getUserIdFromRequest(request: Request): string | null {
  const token = getSessionTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

function serializeCookie(
  name: string,
  value: string,
  maxAge: number,
  clear = false,
): string {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (clear) {
    parts.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  }
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}
