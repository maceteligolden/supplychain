import { env } from "@/config/env";
import {
  decodeSessionPayload,
  isSessionExpired,
  parseSessionToken,
} from "@/lib/auth/session-payload";

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signPayloadEdge(encoded: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encoded),
  );

  return bufferToBase64Url(signature);
}

/** Verifies a session token in Edge middleware (Web Crypto API). */
export async function verifySessionTokenEdge(token: string): Promise<string | null> {
  const parts = parseSessionToken(token);
  if (!parts) {
    return null;
  }

  const expectedSignature = await signPayloadEdge(parts.encoded);
  if (parts.signature !== expectedSignature) {
    return null;
  }

  const payload = decodeSessionPayload(parts.encoded);
  if (!payload || isSessionExpired(payload.expiresAt)) {
    return null;
  }

  return payload.userId;
}
