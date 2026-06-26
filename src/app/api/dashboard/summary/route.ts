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
  // #region agent log
  fetch("http://127.0.0.1:7635/ingest/f1cde6f2-f277-47a6-90de-e69cad7d975b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "72dc51" },
    body: JSON.stringify({
      sessionId: "72dc51",
      hypothesisId: "A-D",
      location: "api/dashboard/summary/route.ts:GET",
      message: "Dashboard route branch",
      data: {
        useMockApi: env.useMockApi,
        apiBaseUrlSet: Boolean(env.apiBaseUrl),
        branch: env.useMockApi
          ? "mock"
          : env.apiBaseUrl
            ? "proxy"
            : "proxy-missing-url",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
