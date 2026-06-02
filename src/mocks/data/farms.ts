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
    commodityId: "commodity_cocoa_001",
    location: {
      country: "Ghana",
      region: "Ashanti",
      city: "Kumasi",
      latitude: 6.6885,
      longitude: -1.6244,
    },
    createdAt: "2025-01-12T08:00:00.000Z",
    updatedAt: "2025-01-12T08:00:00.000Z",
  },
  {
    id: "farm_kordofan_gum_001",
    name: "Kordofan Gum Farm",
    code: "KORDOFAN_GUM_FARM",
    commodityId: "commodity_gum_arabic_001",
    location: {
      country: "Sudan",
      region: "Kordofan",
      city: "El Obeid",
      latitude: 13.1842,
      longitude: 30.2167,
    },
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

export function createFarm(input: CreateFarmInput): FarmInterface {
  const now = new Date().toISOString();
  const code = input.code.toUpperCase();

  const farm: FarmInterface = {
    id: generateId(),
    name: input.name.trim(),
    code,
    commodityId: input.commodityId,
    location: {
      country: input.location.country.trim(),
      region: input.location.region.trim(),
      city: input.location.city.trim(),
      latitude: input.location.latitude,
      longitude: input.location.longitude,
    },
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
    commodityId: input.commodityId ?? existing.commodityId,
    location,
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
