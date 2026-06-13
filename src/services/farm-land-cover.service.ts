import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthHeaders } from "@/services/auth-headers";
import type { GetFarmLandCoverTimelineOutput } from "@/types/farm-land-cover.interface";

/** Returns mock baseline + assessment land-cover points for a farm. */
export async function getFarmLandCoverTimeline(
  farmId: string,
): Promise<GetFarmLandCoverTimelineOutput> {
  return fetchJson<GetFarmLandCoverTimelineOutput>({
    url: API_ROUTES.farms.landCoverTimeline(farmId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}
