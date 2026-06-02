import { getBatchById, setBatchStatusFromAllocation } from "@/mocks/data/batches";
import { getSupplyChainById } from "@/mocks/data/supply-chains";
import type {
  BatchAllocationInterface,
  CreateBatchAllocationInput,
  UpdateBatchAllocationInput,
} from "@/types/batch-allocation.interface";
import type { SupplyChainAllocationInput } from "@/types/supply-chain.interface";

const SEED_ALLOCATIONS: BatchAllocationInterface[] = [];

/** In-memory mutable mock store — swap for MongoDB in production. */
let allocations: BatchAllocationInterface[] = [...SEED_ALLOCATIONS];

function generateId(): string {
  return `allocation_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllBatchAllocations(): BatchAllocationInterface[] {
  return [...allocations];
}

export function getBatchAllocationsByFarmId(
  farmId: string,
): BatchAllocationInterface[] {
  return allocations.filter((allocation) => {
    const batch = getBatchById(allocation.batchId);
    return batch?.farmId === farmId;
  });
}

export function getBatchAllocationsBySupplyChainId(
  supplyChainId: string,
): BatchAllocationInterface[] {
  return allocations.filter((item) => item.supplyChainId === supplyChainId);
}

export function getBatchAllocationById(
  id: string,
): BatchAllocationInterface | undefined {
  return allocations.find((item) => item.id === id);
}

export function getAllocationsByBatchId(batchId: string): BatchAllocationInterface[] {
  return allocations.filter((item) => item.batchId === batchId);
}

export function getTotalAllocatedForBatch(
  batchId: string,
  excludeAllocationId?: string,
): number {
  return allocations
    .filter((item) => item.batchId === batchId && item.id !== excludeAllocationId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function isSupplyChainReferencedByAllocation(supplyChainId: string): boolean {
  return allocations.some((item) => item.supplyChainId === supplyChainId);
}

export function createBatchAllocation(
  input: CreateBatchAllocationInput,
): BatchAllocationInterface {
  const batch = getBatchById(input.batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  const supplyChain = getSupplyChainById(input.supplyChainId);
  if (!supplyChain) {
    throw new Error("Supply chain not found");
  }

  if (supplyChain.status !== "ACTIVE") {
    throw new Error("Supply chain is not active");
  }

  const existingTotal = getTotalAllocatedForBatch(input.batchId);
  if (existingTotal + input.quantity > batch.quantity) {
    throw new Error("Allocation exceeds remaining batch quantity");
  }

  const now = new Date().toISOString();
  const allocation: BatchAllocationInterface = {
    id: generateId(),
    batchId: input.batchId,
    supplyChainId: input.supplyChainId,
    quantity: input.quantity,
    allocatedAt: input.allocatedAt ?? now,
    createdAt: now,
    updatedAt: now,
  };

  allocations = [...allocations, allocation];
  setBatchStatusFromAllocation(input.batchId, getTotalAllocatedForBatch(input.batchId));
  return allocation;
}

export function updateBatchAllocation(
  id: string,
  input: UpdateBatchAllocationInput,
): BatchAllocationInterface | undefined {
  const index = allocations.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = allocations[index];
  if (!existing) {
    return undefined;
  }

  const batch = getBatchById(existing.batchId);
  if (!batch) {
    return undefined;
  }

  const nextQuantity = input.quantity ?? existing.quantity;
  const otherTotal = getTotalAllocatedForBatch(existing.batchId, id);
  if (otherTotal + nextQuantity > batch.quantity) {
    throw new Error("Allocation exceeds remaining batch quantity");
  }

  const updated: BatchAllocationInterface = {
    ...existing,
    quantity: nextQuantity,
    allocatedAt: input.allocatedAt ?? existing.allocatedAt,
    updatedAt: new Date().toISOString(),
  };

  allocations = allocations.map((item) => (item.id === id ? updated : item));
  setBatchStatusFromAllocation(
    existing.batchId,
    getTotalAllocatedForBatch(existing.batchId),
  );
  return updated;
}

export function deleteBatchAllocation(id: string): boolean {
  const existing = getBatchAllocationById(id);
  if (!existing) {
    return false;
  }

  allocations = allocations.filter((item) => item.id !== id);
  setBatchStatusFromAllocation(
    existing.batchId,
    getTotalAllocatedForBatch(existing.batchId),
  );
  return true;
}

function validateAllocationQuantity(
  batchId: string,
  quantity: number,
  supplyChainId: string,
): void {
  const batch = getBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  if (quantity <= 0) {
    throw new Error("Allocation quantity must be greater than zero");
  }

  const existingOnChain = allocations.find(
    (item) => item.batchId === batchId && item.supplyChainId === supplyChainId,
  );
  const totalAllocated = getTotalAllocatedForBatch(batchId);
  const currentOnChain = existingOnChain?.quantity ?? 0;
  const otherAllocated = totalAllocated - currentOnChain;

  if (otherAllocated + quantity > batch.quantity) {
    throw new Error("Allocation exceeds remaining batch quantity");
  }
}

/**
 * Replaces all allocations for a supply chain with the given payload.
 * Allocations with quantity <= 0 are omitted (removed).
 */
export function syncSupplyChainAllocations(
  supplyChainId: string,
  items: SupplyChainAllocationInput[],
): BatchAllocationInterface[] {
  const supplyChain = getSupplyChainById(supplyChainId);
  if (!supplyChain) {
    throw new Error("Supply chain not found");
  }

  const normalized = items.filter((item) => item.quantity > 0);

  for (const item of normalized) {
    validateAllocationQuantity(item.batchId, item.quantity, supplyChainId);
  }

  const existingForChain = getBatchAllocationsBySupplyChainId(supplyChainId);
  const nextBatchIds = new Set(normalized.map((item) => item.batchId));

  for (const existing of existingForChain) {
    if (!nextBatchIds.has(existing.batchId)) {
      deleteBatchAllocation(existing.id);
    }
  }

  const result: BatchAllocationInterface[] = [];

  for (const item of normalized) {
    const existing = getBatchAllocationsBySupplyChainId(supplyChainId).find(
      (allocation) => allocation.batchId === item.batchId,
    );

    if (existing) {
      const updated = updateBatchAllocation(existing.id, { quantity: item.quantity });
      if (updated) {
        result.push(updated);
      }
    } else {
      result.push(
        createBatchAllocation({
          batchId: item.batchId,
          supplyChainId,
          quantity: item.quantity,
        }),
      );
    }
  }

  return result;
}

/** Reset store to seed data — useful for tests only. */
export function resetBatchAllocationsMockStore(): void {
  allocations = [...SEED_ALLOCATIONS];
}
