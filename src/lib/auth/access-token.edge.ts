import { jwtVerify } from "jose";

import { env } from "@/config/env";

type AccessTokenPayloadInterface = {
  sub: string;
  role: string;
};

/**
 * Verifies a backend access JWT in Edge middleware using Web Crypto.
 */
export async function verifyAccessTokenEdge(
  accessTokenInput: string,
): Promise<AccessTokenPayloadInterface | null> {
  try {
    const secretKey = new TextEncoder().encode(env.jwtSecret);
    const verified = await jwtVerify(accessTokenInput, secretKey);
    const payload = verified.payload;

    if (!payload.sub || !payload.role) {
      return null;
    }

    const roleValue = payload.role;
    const roleString =
      typeof roleValue === "string"
        ? roleValue
        : typeof roleValue === "number" || typeof roleValue === "boolean"
          ? String(roleValue)
          : "SUPER_ADMIN";

    return {
      sub: String(payload.sub),
      role: roleString,
    };
  } catch {
    return null;
  }
}
