export const ACTOR_TYPES = [
  "COLLECTION_CENTRE",
  "PROCESSOR",
  "WAREHOUSE",
  "EXPORTER",
  "CARRIER",
] as const;

export type ActorType = (typeof ACTOR_TYPES)[number];

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  COLLECTION_CENTRE: "Collection centre",
  PROCESSOR: "Processor",
  WAREHOUSE: "Warehouse",
  EXPORTER: "Exporter",
  CARRIER: "Carrier",
};

export const ACTOR_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type ActorStatus = (typeof ACTOR_STATUSES)[number];

export const ACTOR_STATUS_LABELS: Record<ActorStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
