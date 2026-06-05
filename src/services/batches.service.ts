import { API_ROUTES } from "@/config/api-routes";
import { getAuthHeaders } from "@/services/auth-headers";
import { fetchJson } from "@/services/api-client";
import type {
  CreateBatchInput,
  CreateBatchOutput,
  DeleteBatchOutput,
  GetBatchOutput,
  GetBatchesOutput,
  UpdateBatchInput,
} from "@/types/batch.interface";

/** Returns batches for a farm from the mock API. */
export async function getBatchesByFarmId(farmId: string): Promise<GetBatchesOutput> {
  return fetchJson<GetBatchesOutput>({
    url: API_ROUTES.batches.list(farmId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a single batch by id. */
export async function getBatchById(id: string): Promise<GetBatchOutput> {
  return fetchJson<GetBatchOutput>({
    url: API_ROUTES.batches.detail(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a new batch via the mock API. */
export async function createBatch(input: CreateBatchInput): Promise<CreateBatchOutput> {
  return fetchJson<CreateBatchOutput>({
    url: "/api/batches",
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates an existing batch via the mock API. */
export async function updateBatch(
  id: string,
  input: UpdateBatchInput,
): Promise<GetBatchOutput> {
  return fetchJson<GetBatchOutput>({
    url: API_ROUTES.batches.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Deletes a batch via the mock API. */
export async function deleteBatch(id: string): Promise<DeleteBatchOutput> {
  return fetchJson<DeleteBatchOutput>({
    url: API_ROUTES.batches.detail(id),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}
