import type { SupplyChainStatus } from "@/config/supply-chain-status";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";

export type { SupplyChainStatus };

export interface SupplyChainInterface {
  /** Unique supply chain identifier. */
  id: string;
  /** Display name of the supply chain journey. */
  name: string;
  /** Uppercase unique code. */
  code: string;
  /** Optional description of the chain route or purpose. */
  description?: string;
  /** Whether the chain is available for batch allocation. */
  status: SupplyChainStatus;
  /** Commodity this chain sources produce from (same-commodity farms only). */
  commodityId?: string;
  /** ISO timestamp when the chain was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type SupplyChainAllocationInput = {
  batchId: string;
  quantity: number;
};

export type CreateSupplyChainInput = {
  name: string;
  code: string;
  description?: string;
  status: SupplyChainStatus;
  commodityId?: string;
  allocations?: SupplyChainAllocationInput[];
};

export type UpdateSupplyChainInput = {
  name?: string;
  code?: string;
  description?: string;
  status?: SupplyChainStatus;
  commodityId?: string;
};

export type SyncSupplyChainAllocationsInput = {
  allocations: SupplyChainAllocationInput[];
};

export type SyncSupplyChainAllocationsOutput = {
  allocations: BatchAllocationInterface[];
  total: number;
};

export type GetSupplyChainsOutput = {
  supplyChains: SupplyChainInterface[];
  total: number;
};

export type GetSupplyChainOutput = SupplyChainInterface;

export type DeleteSupplyChainOutput = {
  success: boolean;
  id: string;
};
