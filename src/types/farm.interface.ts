import type { FarmStatus } from "@/config/farm-status";

export type { FarmStatus };

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

export interface FarmOwnerInterface {
  /** Farm owner first name. */
  firstName: string;
  /** Farm owner last name. */
  lastName: string;
  /** Contact phone number. */
  phone: string;
  /** Contact email address. */
  email: string;
}

export interface FarmInterface {
  /** Unique farm identifier. */
  id: string;
  /** Display name of the farm. */
  name: string;
  /** Uppercase unique farm code. */
  code: string;
  /** Lifecycle status for deforestation assessment workflow. */
  status: FarmStatus;
  /** Farm owner contact details. */
  owner: FarmOwnerInterface;
  /** Commodities grown at this farm. */
  commodityIds: string[];
  /** Geographic location of the farm. */
  location: FarmLocationInterface;
  /** Estimated annual production in kilograms. */
  annualProductionEstimateKg?: number;
  /** Farm area in hectares — populated from boundary when mapped. */
  areaHectares?: number;
  /** Whether farm ownership has been verified. */
  ownershipVerified: boolean;
  /** Whether the farm declaration was accepted. */
  declarationAccepted: boolean;
  /** ISO timestamp when the farm was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateFarmInput = {
  name: string;
  code: string;
  status?: FarmStatus;
  owner: FarmOwnerInterface;
  commodityIds: string[];
  location: FarmLocationInterface;
  annualProductionEstimateKg?: number;
  areaHectares?: number;
  ownershipVerified: boolean;
  declarationAccepted: boolean;
};

export type UpdateFarmInput = {
  name?: string;
  code?: string;
  status?: FarmStatus;
  owner?: Partial<FarmOwnerInterface>;
  commodityIds?: string[];
  location?: Partial<FarmLocationInterface>;
  annualProductionEstimateKg?: number;
  areaHectares?: number;
  ownershipVerified?: boolean;
  declarationAccepted?: boolean;
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
