import { findMockUserByEmail, verifyMockUserPassword } from "@/mocks/data/users";
import { buildSessionCookie, createSessionToken } from "@/lib/auth/session";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { createAppError } from "@/lib/errors";
import { env } from "@/config/env";
import {
  loginSchema,
  type LoginSchemaInput,
} from "@/lib/validation/schemas/auth.schema";
import { validate } from "@/lib/validation";
import type { LoginOutput } from "@/types/user.interface";

export async function POST(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/auth/login" });
    } catch (error) {
      return errorResponse({ error, fallbackMessage: "Login failed" });
    }
  }

  return withMockDelay({
    handler: async (): Promise<Response> => {
      try {
        const body: unknown = await request.json();
        const credentials = validate<LoginSchemaInput>({
          schema: loginSchema,
          data: body,
          label: "login credentials",
        });

        const user = findMockUserByEmail(credentials.email);
        if (!user || !verifyMockUserPassword(credentials.email, credentials.password)) {
          throw createAppError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
            statusCode: 401,
          });
        }

        const token = createSessionToken(user.id);
        const output: LoginOutput = { user };

        return jsonResponse({
          data: output,
          headers: { "Set-Cookie": buildSessionCookie(token) },
        });
      } catch (error) {
        return errorResponse({ error, fallbackMessage: "Login failed" });
      }
    },
  });
}
