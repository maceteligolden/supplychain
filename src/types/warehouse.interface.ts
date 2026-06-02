export type WarehouseStatus = "operational" | "maintenance" | "offline";

export interface WarehouseInterface {
  /** Unique warehouse identifier. */
  id: string;
  /** Warehouse display name. */
  name: string;
  /** Warehouse location code. */
  code: string;
  /** City where the warehouse is located. */
  city: string;
  /** Country where the warehouse is located. */
  country: string;
  /** Total storage capacity in cubic meters. */
  capacityCubicM: number;
  /** Currently used capacity in cubic meters. */
  usedCubicM: number;
  /** Current operational status. */
  status: WarehouseStatus;
  /** Number of SKUs stored at this warehouse. */
  skuCount: number;
}

export type GetWarehousesOutput = {
  warehouses: WarehouseInterface[];
  total: number;
};
