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

/** Short explanations shown when selecting an actor type in create/edit forms. */
export const ACTOR_TYPE_DESCRIPTIONS: Record<ActorType, string> = {
  COLLECTION_CENTRE:
    "Receives harvest from farms and consolidates produce before it moves downstream.",
  PROCESSOR:
    "Transforms raw commodity into processed or semi-processed product (e.g. drying, milling).",
  WAREHOUSE:
    "Stores inventory in transit or before export — typically does not change the product.",
  EXPORTER:
    "Ships product out of the origin country to international buyers or importers.",
  CARRIER: "Transports goods between actors (farm → centre, warehouse → port, etc.).",
};

export const ACTOR_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type ActorStatus = (typeof ACTOR_STATUSES)[number];

export const ACTOR_STATUS_LABELS: Record<ActorStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
