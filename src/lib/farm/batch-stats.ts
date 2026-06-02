import type { BatchInterface } from "@/types/batch.interface";

export interface FarmBatchStatsInterface {
  /** Total harvest batches recorded for the farm. */
  totalBatches: number;
  /** Batches with no allocations yet. */
  unallocatedBatches: number;
  /** Batches with at least partial allocation. */
  allocatedBatches: number;
}

/**
 * Computes batch summary counts for a farm detail dashboard.
 */
export function getFarmBatchStats(batches: BatchInterface[]): FarmBatchStatsInterface {
  const unallocatedBatches = batches.filter(
    (batch) => batch.status === "CREATED",
  ).length;
  const allocatedBatches = batches.filter(
    (batch) =>
      batch.status === "PARTIALLY_ALLOCATED" || batch.status === "FULLY_ALLOCATED",
  ).length;

  return {
    totalBatches: batches.length,
    unallocatedBatches,
    allocatedBatches,
  };
}
