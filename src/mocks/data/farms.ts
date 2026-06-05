import { getCommodityById } from "@/mocks/data/commodities";
import type {
  CreateFarmInput,
  FarmInterface,
  UpdateFarmInput,
} from "@/types/farm.interface";

const SEED_FARMS: FarmInterface[] = [
  {
    id: "farm_ashanti_cocoa_001",
    name: "Ashanti Cocoa Farm",
    code: "ASHANTI_COCOA_FARM",
    status: "DRAFT",
    owner: {
      firstName: "Kwame",
      lastName: "Asante",
      phone: "+233241234567",
      email: "kwame.asante@example.com",
    },
    commodityIds: ["commodity_cocoa_001"],
    location: {
      country: "Ghana",
      region: "Ashanti",
      city: "Kumasi",
      latitude: 6.6885,
      longitude: -1.6244,
    },
    annualProductionEstimateKg: 18000,
    ownershipVerified: true,
    declarationAccepted: true,
    createdAt: "2025-01-12T08:00:00.000Z",
    updatedAt: "2025-01-12T08:00:00.000Z",
  },
  {
    id: "farm_kordofan_gum_001",
    name: "Kordofan Gum Farm",
    code: "KORDOFAN_GUM_FARM",
    status: "DRAFT",
    owner: {
      firstName: "Fatima",
      lastName: "Hassan",
      phone: "+249912345678",
      email: "fatima.hassan@example.com",
    },
    commodityIds: ["commodity_gum_arabic_001"],
    location: {
      country: "Sudan",
      region: "Kordofan",
      city: "El Obeid",
      latitude: 13.1842,
      longitude: 30.2167,
    },
    annualProductionEstimateKg: 12000,
    ownershipVerified: true,
    declarationAccepted: true,
    createdAt: "2025-01-12T08:00:00.000Z",
    updatedAt: "2025-01-12T08:00:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let farms: FarmInterface[] = [...SEED_FARMS];

function generateId(): string {
  return `farm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllFarms(): FarmInterface[] {
  return [...farms];
}

export function getFarmById(id: string): FarmInterface | undefined {
  return farms.find((item) => item.id === id);
}

export function isFarmCodeTaken(code: string, excludeId?: string): boolean {
  return farms.some(
    (item) => item.code === code.toUpperCase() && item.id !== excludeId,
  );
}

export function isCommodityLinked(commodityId: string): boolean {
  return Boolean(getCommodityById(commodityId));
}

export function areCommoditiesLinked(commodityIds: string[]): boolean {
  return commodityIds.every((id) => isCommodityLinked(id));
}

export function createFarm(input: CreateFarmInput): FarmInterface {
  const now = new Date().toISOString();
  const code = input.code.toUpperCase();

  const farm: FarmInterface = {
    id: generateId(),
    name: input.name.trim(),
    code,
    status: input.status ?? "DRAFT",
    owner: {
      firstName: input.owner.firstName.trim(),
      lastName: input.owner.lastName.trim(),
      phone: input.owner.phone.trim(),
      email: input.owner.email.trim(),
    },
    commodityIds: [...input.commodityIds],
    location: {
      country: input.location.country.trim(),
      region: input.location.region.trim(),
      city: input.location.city.trim(),
      latitude: input.location.latitude,
      longitude: input.location.longitude,
    },
    annualProductionEstimateKg: input.annualProductionEstimateKg,
    areaHectares: input.areaHectares,
    ownershipVerified: input.ownershipVerified,
    declarationAccepted: input.declarationAccepted,
    createdAt: now,
    updatedAt: now,
  };

  farms = [...farms, farm];
  return farm;
}

export function updateFarm(
  id: string,
  input: UpdateFarmInput,
): FarmInterface | undefined {
  const index = farms.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = farms[index];
  if (!existing) {
    return undefined;
  }

  const code = input.code ? input.code.toUpperCase() : existing.code;
  const owner = input.owner
    ? {
        firstName: input.owner.firstName?.trim() ?? existing.owner.firstName,
        lastName: input.owner.lastName?.trim() ?? existing.owner.lastName,
        phone: input.owner.phone?.trim() ?? existing.owner.phone,
        email: input.owner.email?.trim() ?? existing.owner.email,
      }
    : existing.owner;

  const location = input.location
    ? {
        country: input.location.country?.trim() ?? existing.location.country,
        region: input.location.region?.trim() ?? existing.location.region,
        city: input.location.city?.trim() ?? existing.location.city,
        latitude: input.location.latitude ?? existing.location.latitude,
        longitude: input.location.longitude ?? existing.location.longitude,
      }
    : existing.location;

  const updated: FarmInterface = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    code,
    status: input.status ?? existing.status,
    owner,
    commodityIds: input.commodityIds ?? existing.commodityIds,
    location,
    annualProductionEstimateKg:
      input.annualProductionEstimateKg === null
        ? undefined
        : (input.annualProductionEstimateKg ?? existing.annualProductionEstimateKg),
    areaHectares:
      input.areaHectares === null
        ? undefined
        : (input.areaHectares ?? existing.areaHectares),
    ownershipVerified: input.ownershipVerified ?? existing.ownershipVerified,
    declarationAccepted: input.declarationAccepted ?? existing.declarationAccepted,
    updatedAt: new Date().toISOString(),
  };

  farms = farms.map((item) => (item.id === id ? updated : item));
  return updated;
}

export function deleteFarm(id: string): boolean {
  const before = farms.length;
  farms = farms.filter((item) => item.id !== id);
  return farms.length < before;
}

/** Reset store to seed data — useful for tests only. */
export function resetFarmsMockStore(): void {
  farms = [...SEED_FARMS];
}
