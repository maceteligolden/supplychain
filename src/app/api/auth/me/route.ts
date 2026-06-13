import { findMockUserById } from "@/mocks/data/users";
import { getUserIdFromRequest } from "@/lib/auth/session";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { createAppError } from "@/lib/errors";
import { env } from "@/config/env";
import type { GetCurrentUserOutput } from "@/types/user.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/auth/me" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Failed to get current user" });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
          throw createAppError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
            statusCode: 401,
          });
        }

        const user = findMockUserById(userId);
        if (!user) {
          throw createAppError({
            code: "UNAUTHORIZED",
            message: "Session user not found",
            statusCode: 401,
          });
        }

        const output: GetCurrentUserOutput = user;
        return jsonResponse({ data: output });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Failed to get current user" });
      }
    },
  });
}
