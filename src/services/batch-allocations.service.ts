import { API_ROUTES } from "@/config/api-routes";
import { getAuthHeaders } from "@/services/auth-headers";
import { fetchJson } from "@/services/api-client";
import type {
  CreateBatchAllocationInput,
  DeleteBatchAllocationOutput,
  GetBatchAllocationOutput,
  GetBatchAllocationsOutput,
  UpdateBatchAllocationInput,
} from "@/types/batch-allocation.interface";

/** Returns allocations for batches on a farm from the mock API. */
export async function getBatchAllocationsByFarmId(
  farmId: string,
): Promise<GetBatchAllocationsOutput> {
  return fetchJson<GetBatchAllocationsOutput>({
    url: API_ROUTES.batchAllocations.listByFarm(farmId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns allocations for a supply chain from the mock API. */
export async function getBatchAllocationsBySupplyChainId(
  supplyChainId: string,
): Promise<GetBatchAllocationsOutput> {
  return fetchJson<GetBatchAllocationsOutput>({
    url: API_ROUTES.batchAllocations.listBySupplyChain(supplyChainId),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a batch allocation via the mock API. */
export async function createBatchAllocation(
  input: CreateBatchAllocationInput,
): Promise<GetBatchAllocationOutput> {
  return fetchJson<GetBatchAllocationOutput>({
    url: "/api/batch-allocations",
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates a batch allocation via the mock API. */
export async function updateBatchAllocation(
  id: string,
  input: UpdateBatchAllocationInput,
): Promise<GetBatchAllocationOutput> {
  return fetchJson<GetBatchAllocationOutput>({
    url: API_ROUTES.batchAllocations.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Deletes a batch allocation via the mock API. */
export async function deleteBatchAllocation(
  id: string,
): Promise<DeleteBatchAllocationOutput> {
  return fetchJson<DeleteBatchAllocationOutput>({
    url: API_ROUTES.batchAllocations.detail(id),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}
