import type { CommodityUnit } from "@/config/commodity-units";

export type { CommodityUnit };

export interface CommodityInterface {
  /** Unique commodity identifier. */
  id: string;
  /** Display name (e.g. Cocoa). */
  name: string;
  /** Uppercase unique code (e.g. COCOA). */
  code: string;
  /** Public URL path to the commodity image. */
  imageUrl: string;
  /** Unit of measurement for this commodity. */
  unit: CommodityUnit;
  /** ISO timestamp when the commodity was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateCommodityInput = {
  name: string;
  code: string;
  unit: CommodityUnit;
  /** Optional filename from the upload stub — used to build mock imageUrl. */
  imageFileName?: string;
};

export type UpdateCommodityInput = {
  name?: string;
  code?: string;
  unit?: CommodityUnit;
  imageFileName?: string;
};

export type GetCommoditiesOutput = {
  commodities: CommodityInterface[];
  total: number;
};

export type GetCommodityOutput = CommodityInterface;

export type DeleteCommodityOutput = {
  success: boolean;
  id: string;
};
