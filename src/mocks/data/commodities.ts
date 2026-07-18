import { buildMockImageUrl } from "@/lib/commodity/image-url";
import type {
  CommodityInterface,
  CreateCommodityInput,
  UpdateCommodityInput,
} from "@/types/commodity.interface";

const SEED_COMMODITIES: CommodityInterface[] = [
  {
    id: "commodity_cocoa_001",
    name: "Cocoa",
    code: "COCOA",
    imageUrl: "/commodities/cocoa.png",
    unit: "KG",
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-01-10T08:00:00.000Z",
  },
  {
    id: "commodity_gum_arabic_001",
    name: "Gum Arabic",
    code: "GUM_ARABIC",
    imageUrl: "/commodities/gum-arabic.png",
    unit: "KG",
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-01-10T08:00:00.000Z",
  },
];

/** In-memory mutable mock store — swap for MongoDB in production. */
let commodities: CommodityInterface[] = [...SEED_COMMODITIES];

function generateId(): string {
  return `commodity_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Generates the next PREFIX-YYYY-NNNN commodity code for the mock store. */
function nextCommodityCode(): string {
  const year = new Date().getUTCFullYear();
  const prefix = `COM-${year}-`;
  let maxSequence = 0;
  for (const item of commodities) {
    if (!item.code.startsWith(prefix)) {
      continue;
    }
    const sequence = Number(item.code.slice(prefix.length));
    if (!Number.isNaN(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }
  return `${prefix}${String(maxSequence + 1).padStart(4, "0")}`;
}

export function getAllCommodities(): CommodityInterface[] {
  return [...commodities];
}

export function getCommodityById(id: string): CommodityInterface | undefined {
  return commodities.find((item) => item.id === id);
}

export function isCodeTaken(code: string, excludeId?: string): boolean {
  return commodities.some(
    (item) => item.code === code.toUpperCase() && item.id !== excludeId,
  );
}

export function createCommodity(input: CreateCommodityInput): CommodityInterface {
  const now = new Date().toISOString();
  const code = nextCommodityCode();

  const commodity: CommodityInterface = {
    id: generateId(),
    name: input.name.trim(),
    code,
    unit: input.unit,
    imageUrl: buildMockImageUrl({ code, imageFileName: input.imageFileName }),
    createdAt: now,
    updatedAt: now,
  };

  commodities = [...commodities, commodity];
  return commodity;
}

export function updateCommodity(
  id: string,
  input: UpdateCommodityInput,
): CommodityInterface | undefined {
  const index = commodities.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  const existing = commodities[index];
  if (!existing) {
    return undefined;
  }

  const updated: CommodityInterface = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    unit: input.unit ?? existing.unit,
    imageUrl: input.imageFileName
      ? buildMockImageUrl({ code: existing.code, imageFileName: input.imageFileName })
      : existing.imageUrl,
    updatedAt: new Date().toISOString(),
  };

  commodities = commodities.map((item) => (item.id === id ? updated : item));
  return updated;
}

export function deleteCommodity(id: string): boolean {
  const before = commodities.length;
  commodities = commodities.filter((item) => item.id !== id);
  return commodities.length < before;
}

/** Reset store to seed data — useful for tests only. */
export function resetCommoditiesMockStore(): void {
  commodities = [...SEED_COMMODITIES];
}
