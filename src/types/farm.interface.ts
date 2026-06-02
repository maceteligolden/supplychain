export interface FarmLocationInterface {
  /** Country where the farm is located. */
  country: string;
  /** Region or state within the country. */
  region: string;
  /** City or nearest town. */
  city: string;
  /** Optional GPS latitude (-90 to 90). */
  latitude?: number;
  /** Optional GPS longitude (-180 to 180). */
  longitude?: number;
}

export interface FarmInterface {
  /** Unique farm identifier. */
  id: string;
  /** Display name of the farm. */
  name: string;
  /** Uppercase unique farm code. */
  code: string;
  /** Commodity grown at this farm. */
  commodityId: string;
  /** Geographic location of the farm. */
  location: FarmLocationInterface;
  /** ISO timestamp when the farm was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateFarmInput = {
  name: string;
  code: string;
  commodityId: string;
  location: FarmLocationInterface;
};

export type UpdateFarmInput = {
  name?: string;
  code?: string;
  commodityId?: string;
  location?: Partial<FarmLocationInterface>;
};

export type GetFarmsOutput = {
  farms: FarmInterface[];
  total: number;
};

export type GetFarmOutput = FarmInterface;

export type DeleteFarmOutput = {
  success: boolean;
  id: string;
};
