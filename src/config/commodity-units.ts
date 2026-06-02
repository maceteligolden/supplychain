/** Allowed commodity units — single source of truth for forms, validation, and display. */
export const COMMODITY_UNITS = ["KG", "TON", "LITRE", "BAG", "UNIT"] as const;

export type CommodityUnit = (typeof COMMODITY_UNITS)[number];

export const COMMODITY_UNIT_LABELS: Record<CommodityUnit, string> = {
  KG: "Kilogram (KG)",
  TON: "Metric ton (TON)",
  LITRE: "Litre (LITRE)",
  BAG: "Bag (BAG)",
  UNIT: "Unit (UNIT)",
};
