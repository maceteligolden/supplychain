import { API_ROUTES } from "@/config/api-routes";
import { getAuthHeaders } from "@/services/auth-headers";
import { fetchJson } from "@/services/api-client";
import type { GetSupplyChainReportOutput } from "@/types/supply-chain-report.interface";
import type {
  CreateSupplyChainInput,
  DeleteSupplyChainOutput,
  GetSupplyChainOutput,
  GetSupplyChainsOutput,
  SyncSupplyChainAllocationsInput,
  SyncSupplyChainAllocationsOutput,
  UpdateSupplyChainInput,
} from "@/types/supply-chain.interface";

/** Returns all supply chains from the mock API. */
export async function getSupplyChains(): Promise<GetSupplyChainsOutput> {
  return fetchJson<GetSupplyChainsOutput>({
    url: API_ROUTES.supplyChains.list,
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a single supply chain by id. */
export async function getSupplyChainById(id: string): Promise<GetSupplyChainOutput> {
  return fetchJson<GetSupplyChainOutput>({
    url: API_ROUTES.supplyChains.detail(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Returns a traceability report payload for export. */
export async function getSupplyChainReport(
  id: string,
): Promise<GetSupplyChainReportOutput> {
  return fetchJson<GetSupplyChainReportOutput>({
    url: API_ROUTES.supplyChains.report(id),
    options: {
      method: "GET",
      cache: "no-store",
      headers: await getAuthHeaders(),
    },
  });
}

/** Creates a new supply chain via the mock API. */
export async function createSupplyChain(
  input: CreateSupplyChainInput,
): Promise<GetSupplyChainOutput> {
  return fetchJson<GetSupplyChainOutput>({
    url: API_ROUTES.supplyChains.list,
    options: {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Updates an existing supply chain via the mock API. */
export async function updateSupplyChain(
  id: string,
  input: UpdateSupplyChainInput,
): Promise<GetSupplyChainOutput> {
  return fetchJson<GetSupplyChainOutput>({
    url: API_ROUTES.supplyChains.detail(id),
    options: {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}

/** Deletes a supply chain via the mock API. */
export async function deleteSupplyChain(id: string): Promise<DeleteSupplyChainOutput> {
  return fetchJson<DeleteSupplyChainOutput>({
    url: API_ROUTES.supplyChains.detail(id),
    options: {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  });
}

/** Replaces all batch allocations for a supply chain. */
export async function syncSupplyChainAllocations(
  id: string,
  input: SyncSupplyChainAllocationsInput,
): Promise<SyncSupplyChainAllocationsOutput> {
  return fetchJson<SyncSupplyChainAllocationsOutput>({
    url: API_ROUTES.supplyChains.allocations(id),
    options: {
      method: "PUT",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    },
  });
}
