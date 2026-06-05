import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import type {
  DeleteFarmBoundaryOutput,
  GetFarmBoundaryOutput,
  UpsertFarmBoundaryInput,
  UpsertFarmBoundaryOutput,
} from "@/types/farm-boundary.interface";

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

async function getAuthHeaders(): Promise<Record<string, string>> {
  return getServerCookieHeader();
}

/** Returns the boundary for a farm, or null when not mapped. */
export async function getFarmBoundaryByFarmId(
  farmId: string,
): Promise<GetFarmBoundaryOutput> {
  return fetchJson<GetFarmBoundaryOutput>({
    url: API_ROUTES.farms.boundary(farmId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates or replaces a farm boundary polygon. */
export async function upsertFarmBoundary(
  farmId: string,
  input: UpsertFarmBoundaryInput,
): Promise<UpsertFarmBoundaryOutput> {
  return fetchJson<UpsertFarmBoundaryOutput>({
    url: API_ROUTES.farms.boundary(farmId),
    options: {
      method: "PUT",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Removes a farm boundary and reverts mapped farm status when applicable. */
export async function deleteFarmBoundary(
  farmId: string,
): Promise<DeleteFarmBoundaryOutput> {
  return fetchJson<DeleteFarmBoundaryOutput>({
    url: API_ROUTES.farms.boundary(farmId),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}
