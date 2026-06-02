/** Allowed supply chain statuses — single source for forms, validation, and display. */
export const SUPPLY_CHAIN_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type SupplyChainStatus = (typeof SUPPLY_CHAIN_STATUSES)[number];

export const SUPPLY_CHAIN_STATUS_LABELS: Record<SupplyChainStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
