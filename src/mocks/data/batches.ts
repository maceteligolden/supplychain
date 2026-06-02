import { generateBatchNumber } from "@/lib/batch/batch-number-generator";
import { deriveBatchStatus } from "@/lib/batch/batch-status";
import { getCommodityById } from "@/mocks/data/commodities";
import { getFarmById } from "@/mocks/data/farms";
import type {
  BatchInterface,
  BatchStatus,
  CreateBatchInput,
  UpdateBatchInput,
} from "@/types/batch.interface";

const SEED_BATCHES: BatchInterface[] = [
  {
    id: "batch_ashanti_2025_001",
    batchNumber: "BATCH_ASHANTI_COCOA_FARM_2025_001",
    farmId: "farm_ashanti_cocoa_001",
    commodityId: "commodity_cocoa_001",
    harvestDate: "2025-02-01",
    quantity: 5000,
    unit: "KG",
    status: "CREATED",
    createdAt: "2025-02-01T08:00:00.000Z",
    updatedAt: "2025-02-01T08:00:00.000Z",
  },
  {
    id: "batch_kordofan_2025_001",
    batchNumber: "BATCH_KORDOFAN_GUM_FARM_2025_001",
    farmId: "farm_kordofan_gum_001",
    commodityId: "commodity_gum_arabic_001",
    harvestDate: "2025-02-05",
    quantity: 2000,
    unit: "KG",
    status: "CREATED",
    createdAt: "2025-02-05T08:00:00.000Z",
    updatedAt: "2025-02-05T08:00:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let batches: BatchInterface[] = [...SEED_BATCHES];

function generateId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllBatches(): BatchInterface[] {
  return [...batches];
}

export function getBatchesByFarmId(farmId: string): BatchInterface[] {
  return batches.filter((item) => item.farmId === farmId);
}

export function getBatchById(id: string): BatchInterface | undefined {
  return batches.find((item) => item.id === id);
}

export function isBatchNumberTaken(batchNumber: string, excludeId?: string): boolean {
  return batches.some(
    (item) => item.batchNumber === batchNumber.toUpperCase() && item.id !== excludeId,
  );
}

export function createBatch(input: CreateBatchInput): BatchInterface {
  const farm = getFarmById(input.farmId);
  if (!farm) {
    throw new Error("Farm not found");
  }

  const commodity = getCommodityById(farm.commodityId);
  if (!commodity) {
    throw new Error("Commodity not found");
  }

  const batchNumber =
    input.batchNumber ??
    generateBatchNumber({
      farmCode: farm.code,
      harvestDate: input.harvestDate,
      existingBatches: batches,
    });

  const now = new Date().toISOString();
  const batch: BatchInterface = {
    id: generateId(),
    batchNumber,
    farmId: input.farmId,
    commodityId: farm.commodityId,
    harvestDate: input.harvestDate,
    quantity: input.quantity,
    unit: commodity.unit,
    status: "CREATED",
    createdAt: now,
    updatedAt: now,
  };

  batches = [...batches, batch];
  return batch;
}

export function updateBatch(
  id: string,
  input: UpdateBatchInput,
  allocatedTotal = 0,
): BatchInterface | undefined {
  const index = batches.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = batches[index];
  if (!existing) {
    return undefined;
  }

  const quantity = input.quantity ?? existing.quantity;

  const updated: BatchInterface = {
    ...existing,
    harvestDate: input.harvestDate ?? existing.harvestDate,
    quantity,
    status: deriveBatchStatus(quantity, allocatedTotal),
    updatedAt: new Date().toISOString(),
  };

  batches = batches.map((item) => (item.id === id ? updated : item));
  return updated;
}

export function setBatchStatusFromAllocation(
  batchId: string,
  allocatedTotal: number,
): BatchInterface | undefined {
  const batch = getBatchById(batchId);
  if (!batch) {
    return undefined;
  }

  const updated: BatchInterface = {
    ...batch,
    status: deriveBatchStatus(batch.quantity, allocatedTotal),
    updatedAt: new Date().toISOString(),
  };

  batches = batches.map((item) => (item.id === batchId ? updated : item));
  return updated;
}

export function deleteBatch(id: string): boolean {
  const before = batches.length;
  batches = batches.filter((item) => item.id !== id);
  return batches.length < before;
}

/** Reset store to seed data — useful for tests only. */
export function resetBatchesMockStore(): void {
  batches = [...SEED_BATCHES];
}

export type { BatchStatus };
