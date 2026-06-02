export interface BatchAllocationInterface {
  /** Unique allocation identifier. */
  id: string;
  /** Batch being allocated. */
  batchId: string;
  /** Supply chain receiving the allocation. */
  supplyChainId: string;
  /** Allocated quantity (same unit as batch). */
  quantity: number;
  /** ISO timestamp when allocation was recorded. */
  allocatedAt: string;
  /** ISO timestamp when the record was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateBatchAllocationInput = {
  batchId: string;
  supplyChainId: string;
  quantity: number;
  allocatedAt?: string;
};

export type UpdateBatchAllocationInput = {
  quantity?: number;
  allocatedAt?: string;
};

export type GetBatchAllocationsOutput = {
  allocations: BatchAllocationInterface[];
  total: number;
};

export type GetBatchAllocationOutput = BatchAllocationInterface;

export type DeleteBatchAllocationOutput = {
  success: boolean;
  id: string;
};
