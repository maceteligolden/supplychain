import { buildDashboardSummaryFromMocks } from "@/mocks/data/dashboard";
import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { GetDashboardSummaryOutput } from "@/types/dashboard.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({ request, targetPath: "/api/v1/dashboard" });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to load dashboard summary",
      });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const output: GetDashboardSummaryOutput = buildDashboardSummaryFromMocks();
      return jsonResponse({ data: output });
    },
  });
}
