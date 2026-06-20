import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthHeaders } from "@/services/auth-headers";
import type {
  DeleteFarmBoundaryOutput,
  GetFarmBoundaryOutput,
  GetFarmGeocodeOutput,
  UpsertFarmBoundaryInput,
  UpsertFarmBoundaryOutput,
} from "@/types/farm-boundary.interface";

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

/** Geocodes the farm address for map centering. */
export async function geocodeFarm(farmId: string): Promise<GetFarmGeocodeOutput> {
  return fetchJson<GetFarmGeocodeOutput>({
    url: API_ROUTES.farms.geocode(farmId),
    options: {
      method: "GET",
      cache: "no-store",
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
