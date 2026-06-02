export type InventoryStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "discontinued";

export interface InventoryItemInterface {
  /** Unique inventory record identifier. */
  id: string;
  /** Stock keeping unit code. */
  sku: string;
  /** Product display name. */
  name: string;
  /** Current quantity on hand. */
  quantity: number;
  /** Minimum stock threshold before reorder. */
  reorderLevel: number;
  /** Warehouse location code. */
  warehouseCode: string;
  /** Current stock status. */
  status: InventoryStatus;
  /** Unit cost in USD. */
  unitCost: number;
  /** ISO timestamp of last stock update. */
  updatedAt: string;
}

export type GetInventoryListInput = {
  status?: InventoryStatus;
};

export type GetInventoryListOutput = {
  items: InventoryItemInterface[];
  total: number;
};

export type GetInventoryItemOutput = InventoryItemInterface;
