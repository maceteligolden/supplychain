import { env } from "@/config/env";
import { API_ROUTES } from "@/config/api-routes";
import { fetchJson } from "@/services/api-client";
import { getAuthHeaders } from "@/services/auth-headers";
import type {
  CreateCommodityInput,
  DeleteCommodityOutput,
  GetCommoditiesOutput,
  GetCommodityOutput,
  UpdateCommodityInput,
} from "@/types/commodity.interface";

async function getCommodityAuthHeaders(): Promise<Record<string, string>> {
  return getAuthHeaders();
}

/** Returns all commodities from the mock API. */
export async function getCommodities(): Promise<GetCommoditiesOutput> {
  return fetchJson<GetCommoditiesOutput>({
    url: API_ROUTES.commodities.list,
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getCommodityAuthHeaders(),
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
      headers: await getCommodityAuthHeaders(),
    },
  });
}

/** Creates a new commodity via the API. */
export async function createCommodity(
  input: CreateCommodityInput,
): Promise<GetCommodityOutput> {
  const headers = await getCommodityAuthHeaders();

  if (input.imageFile && !env.useMockApi) {
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("code", input.code);
    formData.append("unit", input.unit);
    formData.append("image", input.imageFile);

    return fetchJson<GetCommodityOutput>({
      url: API_ROUTES.commodities.list,
      options: {
        method: "POST",
        body: formData,
        headers,
      },
    });
  }

  return fetchJson<GetCommodityOutput>({
    url: API_ROUTES.commodities.list,
    options: {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        code: input.code,
        unit: input.unit,
        imageFileName: input.imageFile?.name ?? input.imageFileName,
      }),
      headers,
    },
  });
}

/** Updates an existing commodity via the API. */
export async function updateCommodity(
  id: string,
  input: UpdateCommodityInput,
): Promise<GetCommodityOutput> {
  const headers = await getCommodityAuthHeaders();

  if (input.imageFile && !env.useMockApi) {
    const formData = new FormData();
    if (input.name) {
      formData.append("name", input.name);
    }
    if (input.code) {
      formData.append("code", input.code);
    }
    if (input.unit) {
      formData.append("unit", input.unit);
    }
    formData.append("image", input.imageFile);

    return fetchJson<GetCommodityOutput>({
      url: API_ROUTES.commodities.detail(id),
      options: {
        method: "PATCH",
        body: formData,
        headers,
      },
    });
  }

  return fetchJson<GetCommodityOutput>({
    url: API_ROUTES.commodities.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify({
        name: input.name,
        code: input.code,
        unit: input.unit,
        imageFileName: input.imageFile?.name ?? input.imageFileName,
      }),
      headers,
    },
  });
}

/** Deletes a commodity via the mock API. */
export async function deleteCommodity(id: string): Promise<DeleteCommodityOutput> {
  return fetchJson<DeleteCommodityOutput>({
    url: API_ROUTES.commodities.detail(id),
    options: {
      method: "DELETE",
      headers: await getCommodityAuthHeaders(),
    },
  });
}
