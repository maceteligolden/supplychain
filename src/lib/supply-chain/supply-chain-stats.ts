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

  return Math.max(0, batch.quantity - totalAllocated + onThisChain);
}

/** Returns remaining unallocated quantity for a batch across all supply chains. */
export function getBatchRemainingCapacity(
  batch: BatchInterface,
  allocations: BatchAllocationInterface[],
  editingSupplyChainId?: string,
): number {
  return getBatchMaxAllocation(batch, allocations, editingSupplyChainId);
}

export type AllocationQuantityFeedback = {
  /** Parsed numeric quantity, or null when the draft is empty/whitespace. */
  quantity: number | null;
  /** True when the draft is empty (treated as skip). */
  isEmpty: boolean;
  /** True when the entered value is a valid allocatable quantity. */
  isValid: boolean;
  /** True when the entered value exceeds the batch maximum. */
  isExceeded: boolean;
  /** Remaining capacity after applying the draft quantity (0 when empty). */
  remaining: number;
  /** Accessible helper message for the current draft state. */
  message: string;
};

/**
 * Derives live allocation feedback for a batch quantity draft against its max.
 */
export function getAllocationQuantityFeedback(input: {
  draftValue: string | undefined;
  maxQuantity: number;
  unit: string;
}): AllocationQuantityFeedback {
  const trimmed = (input.draftValue ?? "").trim();
  if (trimmed === "") {
    return {
      quantity: null,
      isEmpty: true,
      isValid: true,
      isExceeded: false,
      remaining: input.maxQuantity,
      message: `Available: ${input.maxQuantity.toLocaleString()} ${input.unit}`,
    };
  }

  const quantity = Number(trimmed);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return {
      quantity: null,
      isEmpty: false,
      isValid: false,
      isExceeded: false,
      remaining: input.maxQuantity,
      message: "Enter a valid quantity of 0 or more.",
    };
  }

  if (quantity === 0) {
    return {
      quantity: 0,
      isEmpty: false,
      isValid: true,
      isExceeded: false,
      remaining: input.maxQuantity,
      message: `Skipping — ${input.maxQuantity.toLocaleString()} ${input.unit} still available.`,
    };
  }

  if (quantity > input.maxQuantity) {
    const overBy = quantity - input.maxQuantity;
    return {
      quantity,
      isEmpty: false,
      isValid: false,
      isExceeded: true,
      remaining: 0,
      message: `Exceeds max by ${overBy.toLocaleString()} ${input.unit}. Max is ${input.maxQuantity.toLocaleString()} ${input.unit}.`,
    };
  }

  const remaining = input.maxQuantity - quantity;
  return {
    quantity,
    isEmpty: false,
    isValid: true,
    isExceeded: false,
    remaining,
    message:
      remaining === 0
        ? `Good — using the full ${input.maxQuantity.toLocaleString()} ${input.unit}.`
        : `Good — ${remaining.toLocaleString()} ${input.unit} remaining.`,
  };
}
