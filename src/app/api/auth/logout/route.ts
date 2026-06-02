import { buildClearSessionCookie } from "@/lib/auth/session";
import { jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { LogoutOutput } from "@/types/user.interface";

export async function POST(): Promise<Response> {
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
