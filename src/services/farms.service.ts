import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import type {
  CreateFarmInput,
  DeleteFarmOutput,
  GetFarmOutput,
  GetFarmsOutput,
  UpdateFarmInput,
} from "@/types/farm.interface";

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

/** Returns all farms from the mock API. */
export async function getFarms(): Promise<GetFarmsOutput> {
  return fetchJson<GetFarmsOutput>({
    url: API_ROUTES.farms.list,
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a single farm by id. */
export async function getFarmById(id: string): Promise<GetFarmOutput> {
  return fetchJson<GetFarmOutput>({
    url: API_ROUTES.farms.detail(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a new farm via the mock API. */
export async function createFarm(input: CreateFarmInput): Promise<GetFarmOutput> {
  return fetchJson<GetFarmOutput>({
    url: API_ROUTES.farms.list,
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates an existing farm via the mock API. */
export async function updateFarm(
  id: string,
  input: UpdateFarmInput,
): Promise<GetFarmOutput> {
  return fetchJson<GetFarmOutput>({
    url: API_ROUTES.farms.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Deletes a farm via the mock API. */
export async function deleteFarm(id: string): Promise<DeleteFarmOutput> {
  return fetchJson<DeleteFarmOutput>({
    url: API_ROUTES.farms.detail(id),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}
