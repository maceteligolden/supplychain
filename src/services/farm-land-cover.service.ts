import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import type { GetFarmLandCoverTimelineOutput } from "@/types/farm-land-cover.interface";

async function getServerCookieHeader(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    return {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get(env.sessionCookieName);

  if (!session) {
    return {};
  }

  return { Cookie: `${env.sessionCookieName}=${session.value}` };
}

/** Returns mock baseline + assessment land-cover points for a farm. */
export async function getFarmLandCoverTimeline(
  farmId: string,
): Promise<GetFarmLandCoverTimelineOutput> {
  return fetchJson<GetFarmLandCoverTimelineOutput>({
    url: API_ROUTES.farms.landCoverTimeline(farmId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getServerCookieHeader(),
    },
  });
}
