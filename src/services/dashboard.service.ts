import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthHeaders } from "@/services/auth-headers";
import type { GetDashboardSummaryOutput } from "@/types/dashboard.interface";

/** Returns aggregated dashboard metrics from the mock API. */
export async function getDashboardSummary(): Promise<GetDashboardSummaryOutput> {
  return fetchJson<GetDashboardSummaryOutput>({
    url: API_ROUTES.dashboard.summary,
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}
