import { buildClearSessionCookie } from "@/lib/auth/session";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { LogoutOutput } from "@/types/user.interface";

export async function POST(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/auth/logout" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Logout failed" });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const output: LogoutOutput = { success: true };

      return jsonResponse({
        data: output,
        headers: { "Set-Cookie": buildClearSessionCookie() },
      });
    },
  });
}
