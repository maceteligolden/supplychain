import {
  errorResponse,
  jsonResponse,
  proxyRequest,
  withMockDelay,
} from "@/lib/api/route-handler";
import { env } from "@/config/env";
import type { GetFarmGeocodeOutput } from "@/types/farm-boundary.interface";

export async function GET(request: Request): Promise<Response> {
  if (!env.useMockApi) {
    try {
      return await proxyRequest({
        request,
        targetPath: "/api/v1/geocode",
      });
    } catch (error) {
      return errorResponse({
        error,
        fallbackMessage: "Failed to geocode address",
      });
    }
  }

  return withMockDelay({
    handler: (): Response => {
      const params = new URL(request.url).searchParams;
      const query = params.get("q")?.trim() ?? "";

      if (!query) {
        return errorResponse({
          error: new Error('Query parameter "q" is required'),
          fallbackMessage: 'Query parameter "q" is required',
        });
      }

      const primary: GetFarmGeocodeOutput = {
        latitude: 9.082,
        longitude: 8.6753,
        displayName: `${query}, Nigeria (mock)`,
      };

      const output: GetFarmGeocodeOutput = {
        ...primary,
        results: [
          primary,
          {
            latitude: 6.5244,
            longitude: 3.3792,
            displayName: `${query} — Lagos, Nigeria (mock)`,
          },
          {
            latitude: 7.3775,
            longitude: 3.947,
            displayName: `${query} — Ibadan, Nigeria (mock)`,
          },
        ],
      };

      return jsonResponse({ data: output });
    },
  });
}
