export const SUPPLY_CHAIN_EVENT_TYPES = [
  "HARVEST",
  "COLLECTION",
  "PROCESSING",
  "WAREHOUSING",
  "EXPORT",
  "IN_TRANSIT",
  "DELIVERED",
] as const;

export type SupplyChainEventType = (typeof SUPPLY_CHAIN_EVENT_TYPES)[number];

export const SUPPLY_CHAIN_EVENT_TYPE_LABELS: Record<SupplyChainEventType, string> = {
  HARVEST: "Harvested at farm",
  COLLECTION: "Collected / aggregated",
  PROCESSING: "Processed",
  WAREHOUSING: "Stored / warehoused",
  EXPORT: "Exported",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
};

/** Returns the sort order index for an event type (0-based). */
export function getSupplyChainEventTypeOrder(type: SupplyChainEventType): number {
  return SUPPLY_CHAIN_EVENT_TYPES.indexOf(type);
}
