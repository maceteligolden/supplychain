import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import type {
  CreateCommodityInput,
  DeleteCommodityOutput,
  GetCommoditiesOutput,
  GetCommodityOutput,
  UpdateCommodityInput,
} from "@/types/commodity.interface";

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

/** Returns all commodities from the mock API. */
export async function getCommodities(): Promise<GetCommoditiesOutput> {
  return fetchJson<GetCommoditiesOutput>({
    url: API_ROUTES.commodities.list,
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a single commodity by id. */
export async function getCommodityById(id: string): Promise<GetCommodityOutput> {
  return fetchJson<GetCommodityOutput>({
    url: API_ROUTES.commodities.detail(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a new commodity via the mock API. */
export async function createCommodity(
  input: CreateCommodityInput,
): Promise<GetCommodityOutput> {
  return fetchJson<GetCommodityOutput>({
    url: API_ROUTES.commodities.list,
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates an existing commodity via the mock API. */
export async function updateCommodity(
  id: string,
  input: UpdateCommodityInput,
): Promise<GetCommodityOutput> {
  return fetchJson<GetCommodityOutput>({
    url: API_ROUTES.commodities.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Deletes a commodity via the mock API. */
export async function deleteCommodity(id: string): Promise<DeleteCommodityOutput> {
  return fetchJson<DeleteCommodityOutput>({
    url: API_ROUTES.commodities.detail(id),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}
