import { describe, expect, it } from "vitest";

import {
  getAllocationQuantityFeedback,
  getBatchMaxAllocation,
} from "@/lib/supply-chain/supply-chain-stats";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";

const batch: BatchInterface = {
  id: "batch-1",
  farmId: "farm-1",
  commodityId: "commodity-1",
  batchNumber: "B-001",
  quantity: 100,
  unit: "KG",
  harvestDate: "2025-01-01",
  status: "CREATED",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const allocations: BatchAllocationInterface[] = [
  {
    id: "alloc-1",
    batchId: "batch-1",
    supplyChainId: "sc-other",
    quantity: 40,
    allocatedAt: "2025-01-02T00:00:00.000Z",
    createdAt: "2025-01-02T00:00:00.000Z",
    updatedAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "alloc-2",
    batchId: "batch-1",
    supplyChainId: "sc-edit",
    quantity: 25,
    allocatedAt: "2025-01-03T00:00:00.000Z",
    createdAt: "2025-01-03T00:00:00.000Z",
    updatedAt: "2025-01-03T00:00:00.000Z",
  },
];

describe("getBatchMaxAllocation", () => {
  it("reclaims quantity already allocated on the editing chain", () => {
    expect(getBatchMaxAllocation(batch, allocations, "sc-edit")).toBe(60);
  });

  it("excludes editing-chain reclaim when creating", () => {
    expect(getBatchMaxAllocation(batch, allocations)).toBe(35);
  });
});

describe("getAllocationQuantityFeedback", () => {
  it("reports available quantity for empty draft", () => {
    const feedback = getAllocationQuantityFeedback({
      draftValue: "",
      maxQuantity: 60,
      unit: "kg",
    });
    expect(feedback.isValid).toBe(true);
    expect(feedback.isEmpty).toBe(true);
    expect(feedback.message).toContain("Available: 60");
  });

  it("marks exceeded quantities as invalid", () => {
    const feedback = getAllocationQuantityFeedback({
      draftValue: "75",
      maxQuantity: 60,
      unit: "kg",
    });
    expect(feedback.isValid).toBe(false);
    expect(feedback.isExceeded).toBe(true);
    expect(feedback.message).toContain("Exceeds max");
  });

  it("reports remaining capacity for good quantities", () => {
    const feedback = getAllocationQuantityFeedback({
      draftValue: "40",
      maxQuantity: 60,
      unit: "kg",
    });
    expect(feedback.isValid).toBe(true);
    expect(feedback.remaining).toBe(20);
    expect(feedback.message).toContain("Good");
  });
});
