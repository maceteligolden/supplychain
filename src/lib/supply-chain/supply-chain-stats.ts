import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";

export type SupplyChainStats = {
  linkedFarmsCount: number;
  allocatedBatchesCount: number;
  totalAllocatedQuantity: number;
  eventsRecordedCount: number;
};

/**
 * Computes summary stats for a supply chain detail page.
 */
export function getSupplyChainStats(input: {
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  events: SupplyChainEventInterface[];
}): SupplyChainStats {
  const farmIds = new Set<string>();
  for (const allocation of input.allocations) {
    const batch = input.batches.find((item) => item.id === allocation.batchId);
    if (batch) {
      farmIds.add(batch.farmId);
    }
  }

  const totalAllocatedQuantity = input.allocations.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return {
    linkedFarmsCount: farmIds.size,
    allocatedBatchesCount: input.allocations.length,
    totalAllocatedQuantity,
    eventsRecordedCount: input.events.length,
  };
}

/** Returns remaining unallocated quantity for a batch across all supply chains. */
export function getBatchRemainingCapacity(
  batch: BatchInterface,
  allocations: BatchAllocationInterface[],
  editingSupplyChainId?: string,
): number {
  const allocatedElsewhere = allocations
    .filter(
      (item) =>
        item.batchId === batch.id &&
        (editingSupplyChainId ? item.supplyChainId !== editingSupplyChainId : true),
    )
    .reduce((sum, item) => sum + item.quantity, 0);

  const allocatedOnChain = editingSupplyChainId
    ? allocations
        .filter(
          (item) =>
            item.batchId === batch.id && item.supplyChainId === editingSupplyChainId,
        )
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return batch.quantity - allocatedElsewhere - allocatedOnChain + allocatedOnChain;
}

/** Max allocatable quantity for a batch when editing/creating a chain allocation. */
export function getBatchMaxAllocation(
  batch: BatchInterface,
  allocations: BatchAllocationInterface[],
  supplyChainId?: string,
): number {
  const totalAllocated = allocations
    .filter((item) => item.batchId === batch.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const onThisChain = supplyChainId
    ? allocations
        .filter(
          (item) => item.batchId === batch.id && item.supplyChainId === supplyChainId,
        )
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return batch.quantity - totalAllocated + onThisChain;
}
