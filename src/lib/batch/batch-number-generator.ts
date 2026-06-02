import type { BatchInterface } from "@/types/batch.interface";

/**
 * Generates the next batch number for a farm and harvest year.
 * Pattern: BATCH_{FARM_CODE}_{YYYY}_{seq}
 */
export function generateBatchNumber(input: {
  farmCode: string;
  harvestDate: string;
  existingBatches: BatchInterface[];
}): string {
  const year = input.harvestDate.slice(0, 4);
  const prefix = `BATCH_${input.farmCode}_${year}_`;
  const sameFarmYear = input.existingBatches.filter(
    (batch) =>
      batch.batchNumber.startsWith(prefix) && batch.harvestDate.startsWith(year),
  );
  const nextSequence = sameFarmYear.length + 1;
  return `${prefix}${String(nextSequence).padStart(3, "0")}`;
}
