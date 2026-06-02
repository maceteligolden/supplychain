import type { AuthSessionInterface } from "@/types/user.interface";

type SessionPayloadInterface = AuthSessionInterface;

function base64UrlDecode(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSessionPayload(payload: SessionPayloadInterface): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeSessionPayload(encoded: string): SessionPayloadInterface | null {
  try {
    const json = base64UrlDecode(encoded);
    const parsed = JSON.parse(json) as SessionPayloadInterface;
    if (!parsed.userId || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function parseSessionToken(token: string): {
  encoded: string;
  signature: string;
} | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }
  return { encoded, signature };
}
