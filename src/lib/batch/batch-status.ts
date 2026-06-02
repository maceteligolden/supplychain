import type { BatchStatus } from "@/types/batch.interface";

/**
 * Derives batch allocation status from total allocated quantity vs batch quantity.
 */
export function deriveBatchStatus(
  batchQuantity: number,
  allocatedTotal: number,
): BatchStatus {
  if (allocatedTotal <= 0) {
    return "CREATED";
  }

  if (allocatedTotal >= batchQuantity) {
    return "FULLY_ALLOCATED";
  }

  return "PARTIALLY_ALLOCATED";
}
