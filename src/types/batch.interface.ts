import type { CommodityUnit } from "@/config/commodity-units";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";

export type BatchStatus = "CREATED" | "PARTIALLY_ALLOCATED" | "FULLY_ALLOCATED";

export type BatchCreationStepStatus = "pending" | "completed" | "skipped" | "failed";

export interface BatchCreationStepInterface {
  id: string;
  label: string;
  status: BatchCreationStepStatus;
  detail?: string;
}

export interface BatchInterface {
  /** Unique batch identifier. */
  id: string;
  /** Globally unique harvest batch number. */
  batchNumber: string;
  /** Farm where the batch was harvested. */
  farmId: string;
  /** Commodity denormalized from the farm at creation. */
  commodityId: string;
  /** Harvest date (ISO date YYYY-MM-DD). */
  harvestDate: string;
  /** Total harvested quantity. */
  quantity: number;
  /** Unit copied from commodity at creation. */
  unit: CommodityUnit;
  /** Allocation progress status. */
  status: BatchStatus;
  /** ISO timestamp when the batch was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateBatchInput = {
  farmId: string;
  harvestDate: string;
  quantity: number;
  batchNumber?: string;
  /** Required when the farm grows more than one commodity. */
  commodityId?: string;
};

export type UpdateBatchInput = {
  harvestDate?: string;
  quantity?: number;
};

export type GetBatchesOutput = {
  batches: BatchInterface[];
  total: number;
};

export type GetBatchOutput = BatchInterface;

export type CreateBatchOutput = {
  batch: BatchInterface;
  assessment: FarmAssessmentInterface | null;
  steps: BatchCreationStepInterface[];
};

export type DeleteBatchOutput = {
  success: boolean;
  id: string;
};
