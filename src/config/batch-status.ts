import type { BatchStatus } from "@/types/batch.interface";

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  CREATED: "Created",
  PARTIALLY_ALLOCATED: "Partially allocated",
  FULLY_ALLOCATED: "Fully allocated",
};
