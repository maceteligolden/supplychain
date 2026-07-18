import { describe, expect, it } from "vitest";

import {
  getAllowedNextEventTypes,
  getImmediateNextEventType,
  validateEventSequence,
} from "@/lib/supply-chain-event/validate-event-sequence";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";

function event(type: SupplyChainEventInterface["type"]): SupplyChainEventInterface {
  return {
    id: `evt-${type}`,
    supplyChainId: "sc-1",
    type,
    occurredAt: "2025-01-01T00:00:00.000Z",
    actorId: "actor-1",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

describe("getImmediateNextEventType", () => {
  it("returns HARVEST for an empty chain", () => {
    expect(getImmediateNextEventType([])).toBe("HARVEST");
  });

  it("returns the next sequential type only", () => {
    expect(getImmediateNextEventType([event("HARVEST")])).toBe("COLLECTION");
  });

  it("returns undefined when the lifecycle is complete", () => {
    expect(
      getImmediateNextEventType([
        event("HARVEST"),
        event("COLLECTION"),
        event("PROCESSING"),
        event("WAREHOUSING"),
        event("EXPORT"),
        event("IN_TRANSIT"),
        event("DELIVERED"),
      ]),
    ).toBeUndefined();
  });
});

describe("getAllowedNextEventTypes", () => {
  it("exposes all forward-allowed types so users can skip ahead", () => {
    expect(getAllowedNextEventTypes([event("HARVEST")])).toEqual([
      "COLLECTION",
      "PROCESSING",
      "WAREHOUSING",
      "EXPORT",
      "IN_TRANSIT",
      "DELIVERED",
    ]);
  });
});

describe("validateEventSequence", () => {
  it("still rejects duplicates and backwards steps", () => {
    expect(validateEventSequence([event("HARVEST")], "HARVEST").valid).toBe(false);
    expect(validateEventSequence([event("COLLECTION")], "HARVEST").valid).toBe(false);
  });
});
