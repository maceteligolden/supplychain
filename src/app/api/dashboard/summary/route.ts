import { buildDashboardSummaryFromMocks } from "@/mocks/data/dashboard";
import { jsonResponse, withMockDelay } from "@/lib/api/route-handler";
import type { GetDashboardSummaryOutput } from "@/types/dashboard.interface";

export async function GET(): Promise<Response> {
  return withMockDelay({
    handler: (): Response => {
      const output: GetDashboardSummaryOutput = buildDashboardSummaryFromMocks();
      return jsonResponse({ data: output });
    },
  });
}
